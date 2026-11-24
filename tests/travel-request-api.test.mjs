import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const routeSource = readFileSync(new URL("../app/api/trip-requests/route.ts", import.meta.url), "utf8");
const validationSource = readFileSync(new URL("../lib/travel-requests/validation.ts", import.meta.url), "utf8");
function transpile(source) {
  return ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
}
const validationExports = {};
vm.runInNewContext(transpile(validationSource), { exports: validationExports, require: () => { throw new Error("Unexpected validation import"); } });

function loadRoute({ rateAllowed = true, saved = null, created = "K360-TEST", turnstile = true, hostname = "preview.invalid", action = "trip_request" } = {}) {
  const exports = {};
  const calls = { rpc: [], fetch: [], after: [] };
  const db = {
    rpc: async (name, args) => {
      calls.rpc.push({ name, args });
      if (name === "consume_trip_request_limit") return { data: rateAllowed, error: null };
      return { data: created, error: null };
    },
    from: (table) => ({ table, select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: saved, error: null }) }) }) }),
  };
  vm.runInNewContext(transpile(routeSource), {
    exports,
    require: (name) => {
      if (name === "node:crypto") return require("node:crypto");
      if (name === "next/server") return { after: (callback) => calls.after.push(callback) };
      if (name === "@/lib/travel-requests/database") return { database: () => db };
      if (name === "@/lib/travel-requests/notifications") return { deliverTripNotifications: async () => {} };
      if (name === "@/lib/travel-requests/validation") return validationExports;
      throw new Error(`Unexpected import: ${name}`);
    },
    process: { env: { APP_BASE_URL: "https://preview.invalid", TURNSTILE_SECRET_KEY: "qa-placeholder", TRIP_REQUEST_RATE_LIMIT_SECRET: "qa-only-placeholder" } },
    Response, Request, AbortSignal, TextDecoder, Uint8Array, URL, URLSearchParams,
    fetch: async (url, init) => {
      calls.fetch.push({ url, init });
      return { ok: true, json: async () => ({ success: turnstile, hostname, action }) };
    },
    console: { error: () => {} },
  });
  return { route: exports, calls };
}

function validInput(overrides = {}) {
  return {
    key: "f4992329-8a9a-4bbb-a020-274c48c3bd27", countries: ["KG", "KZ"], interests: ["hiking"], flexible: true,
    startDate: "", endDate: "", adults: 2, children: 0, budget: 2400, name: "Test Guest",
    email: "guest@example.invalid", phone: "", telegram: "", residence: "", preferences: "", contact: "email",
    locale: "en", consent: true, token: "test-turnstile-token", ...overrides,
  };
}
function request(input, { origin = "https://preview.invalid", contentType = "application/json" } = {}) {
  return new Request("https://preview.invalid/api/trip-requests", {
    method: "POST", headers: { "content-type": contentType, origin }, body: JSON.stringify(input),
  });
}

test("trip request API rejects bad content type, malformed input, and wrong origin before database access", async () => {
  const { route, calls } = loadRoute();
  assert.equal((await route.POST(request(validInput(), { contentType: "text/plain" }))).status, 415);
  assert.equal((await route.POST(request({ ...validInput(), key: "bad" }))).status, 400);
  assert.equal((await route.POST(request(validInput(), { origin: "https://attacker.invalid" }))).status, 403);
  assert.equal(calls.rpc.length, 0);
});

test("valid request passes rate limit and Turnstile before the idempotent create RPC", async () => {
  const { route, calls } = loadRoute();
  const response = await route.POST(request(validInput()));
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.reference, "K360-TEST");
  assert.deepEqual(calls.rpc.map(({ name }) => name), ["consume_trip_request_limit", "create_travel_request"]);
  assert.equal(calls.fetch.length, 1);
  assert.equal(calls.after.length, 1);
});

test("rate limited, duplicate, conflict, and failed challenge requests stop before creation", async () => {
  const limited = loadRoute({ rateAllowed: false });
  assert.equal((await limited.route.POST(request(validInput()))).status, 429);
  assert.deepEqual(limited.calls.rpc.map(({ name }) => name), ["consume_trip_request_limit"]);
  assert.equal(limited.calls.fetch.length, 0);

  const fingerprint = createHash("sha256").update(JSON.stringify(validationExports.validate(validInput()).data)).digest("hex");
  const replay = loadRoute({ saved: { fingerprint, reference_number: "K360-OLD" } });
  const replayResponse = await replay.route.POST(request(validInput()));
  assert.equal(replayResponse.status, 200);
  assert.deepEqual(await replayResponse.json(), { reference: "K360-OLD" });
  assert.equal(replay.calls.fetch.length, 0);

  const duplicate = loadRoute({ saved: { fingerprint: "unused", reference_number: "K360-OLD" } });
  assert.equal((await duplicate.route.POST(request(validInput()))).status, 409);
  assert.equal(duplicate.calls.rpc.some(({ name }) => name === "create_travel_request"), false);
  assert.equal(duplicate.calls.fetch.length, 0);

  const challenge = loadRoute({ turnstile: false });
  assert.equal((await challenge.route.POST(request(validInput()))).status, 422);
  assert.equal(challenge.calls.rpc.some(({ name }) => name === "create_travel_request"), false);
});

test("a new request requires a token and the verified hostname and action", async () => {
  const missing = loadRoute();
  const missingResponse = await missing.route.POST(request(validInput({ token: undefined })));
  assert.equal(missingResponse.status, 422);
  assert.equal(missing.calls.fetch.length, 0);
  assert.deepEqual(missing.calls.rpc.map(({ name }) => name), ["consume_trip_request_limit"]);
  assert.equal(missing.calls.after.length, 0);

  for (const result of [{ hostname: "another-preview.invalid" }, { action: "another_form" }, { turnstile: false }]) {
    const { route, calls } = loadRoute(result);
    assert.equal((await route.POST(request(validInput()))).status, 422);
    assert.equal(calls.fetch.length, 1);
    assert.deepEqual(calls.rpc.map(({ name }) => name), ["consume_trip_request_limit"]);
    assert.equal(calls.after.length, 0);
  }
});
