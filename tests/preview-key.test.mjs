import test from "node:test";
import assert from "node:assert/strict";
import { checkPreviewKey, inspectKey, sdkHeaderCheck, usableKey } from "../scripts/check-preview-key.mjs";

const sample = "sb_secret_fake_test_value";
const env = {
  VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "feature/travel-requests-mvp",
  NEXT_PUBLIC_SUPABASE_URL: "https://epyifhlwdhzlpfpnavkg.supabase.co", SUPABASE_SECRET_KEY: sample,
};
const jwt = (payload) => "eyJhbGciOiJIUzI1NiJ9." + Buffer.from(JSON.stringify(payload)).toString("base64url") + ".fake_signature";

test("key inspection detects unsafe input without returning any secret text", () => {
  assert.equal(usableKey(inspectKey(sample)), true);
  for (const [value, flag] of [[` ${sample}`, "surroundingWhitespace"], [`\"${sample}\"`, "quotes"],
    [sample + "\r\n", "crLf"], [sample + "\u0000", "controls"], [sample + "\u2028", "nonAscii"]]) {
    const flags = inspectKey(value);
    assert.equal(flags[flag], true);
    assert.equal(usableKey(flags), false);
    assert.doesNotMatch(JSON.stringify(flags), /fake_test_value/);
  }
  assert.equal(inspectKey(sample + "\r\ninside").httpHeaderConstructible, false);
  assert.equal(inspectKey(sample + "\u2028").httpHeaderConstructible, false);
  assert.equal(usableKey(inspectKey(jwt({ role: "service_role", ref: "epyifhlwdhzlpfpnavkg" }))), true);
  assert.equal(usableKey(inspectKey(jwt({ role: "service_role", ref: "other" }))), false);
  assert.equal(usableKey(inspectKey(jwt({ role: "anon", ref: "epyifhlwdhzlpfpnavkg" }))), false);
});

test("non-Preview checks never read secrets or call the network", async () => {
  for (const scope of [{ VERCEL_ENV: "production" }, { VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "main" }]) {
    Object.defineProperty(scope, "SUPABASE_SECRET_KEY", { get() { throw new Error("Secret must not be read"); } });
    await checkPreviewKey(scope, () => { throw new Error("Unexpected network call"); }, () => { throw new Error("Unexpected log"); });
  }
});

test("the control makes exactly one GET and sends a new key only in apikey", async () => {
  const logs = [];
  let calls = 0;
  await checkPreviewKey(env, async (url, init) => {
    calls += 1;
    assert.equal(url.hostname, "epyifhlwdhzlpfpnavkg.supabase.co");
    assert.equal(init.method, "GET");
    assert.equal(init.headers.get("apikey"), sample);
    assert.equal(init.headers.has("authorization"), false);
    assert.equal(init.redirect, "error");
    return new Response("[]", { status: 200 });
  }, (...args) => logs.push(args));
  assert.equal(calls, 1);
  assert.doesNotMatch(JSON.stringify(logs), /fake_test_value|select=|Bearer /);
  assert.equal(logs.at(-1)[1].status, 200);
});

test("bad headers and wrong projects are stopped before outbound requests", async () => {
  for (const override of [{ SUPABASE_SECRET_KEY: sample + "\r\ninside" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://hrbibxosracivpvgzkyo.supabase.co" }]) {
    await checkPreviewKey({ ...env, ...override }, () => { throw new Error("Unexpected network call"); }, () => {});
  }
});

test("SDK header compatibility probe uses fake credentials only", async () => {
  const result = await sdkHeaderCheck();
  assert.equal(result.apikeyCorrect, true);
  assert.equal(typeof result.newKeyUsedAsBearer, "boolean");
});

test("transport failures do not log error messages, URLs or headers and are not retried", async () => {
  const logs = [];
  let calls = 0;
  await checkPreviewKey(env, async () => {
    calls += 1;
    throw new TypeError("private header " + sample, { cause: { code: "ENOTFOUND" } });
  }, (...args) => logs.push(args));
  assert.equal(calls, 1);
  assert.equal(logs.at(-1)[1].code, "ENOTFOUND");
  assert.doesNotMatch(JSON.stringify(logs), /fake_test_value|private header/);
});
