import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/travel-requests/database.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
let fetchImplementation = async (input, init) => ({ input, init });
const loggedErrors = [];
vm.runInNewContext(javascript, {
  exports,
  require: () => ({ createClient: () => ({}) }),
  AbortSignal,
  Headers,
  fetch: (input, init) => fetchImplementation(input, init),
  console: { error: (...values) => loggedErrors.push(values) },
});

test("database fetch preserves request fields and forwards SDK cancellation", async () => {
  const controller = new AbortController();
  const timeoutController = new AbortController();
  const url = "https://supabase.invalid/rest/v1/staff_members?select=user_id";
  const requestInit = {
    method: "POST",
    headers: { accept: "application/json", "x-retry-count": "2" },
    body: "{\"probe\":true}",
    signal: controller.signal,
  };

  const forwarded = await exports.databaseFetch(url, requestInit);

  assert.equal(forwarded.input, url);
  assert.equal(forwarded.init.method, "POST");
  assert.equal(forwarded.init.headers, requestInit.headers);
  assert.equal(forwarded.init.body, requestInit.body);
  assert.equal(forwarded.init.cache, "no-store");
  assert.ok(forwarded.init.signal);
  assert.equal(forwarded.init.signal.aborted, false);

  controller.abort();
  assert.equal(forwarded.init.signal.aborted, true);

  const bounded = exports.databaseFetchOptions(undefined, timeoutController.signal);
  assert.equal(bounded.signal.aborted, false);
  timeoutController.abort();
  assert.equal(bounded.signal.aborted, true);
});

test("database transport logs only safe error metadata and the SDK retry number", async () => {
  fetchImplementation = async () => {
    const cause = Object.assign(new Error("private transport details"), { code: "ENOTFOUND" });
    throw new TypeError("private request details", { cause });
  };

  await assert.rejects(exports.databaseFetch("https://example.invalid/?token=FAKE_TOKEN", {
    headers: { "X-Retry-Count": "2" },
  }));

  assert.equal(loggedErrors.length, 1);
  const [message, details] = loggedErrors.pop();
  assert.equal(message, "Supabase database transport failure");
  assert.equal(details.stage, "postgrest_fetch");
  assert.equal(details.errorName, "TypeError");
  assert.equal(details.causeName, "Error");
  assert.equal(details.causeCode, "ENOTFOUND");
  assert.equal(details.attempt, 3);
  assert.equal(details.fetchStarted, true);
  assert.ok(Number.isInteger(details.durationMs) && details.durationMs >= 0);
  assert.doesNotMatch(JSON.stringify([message, details]), /private|example\.invalid|FAKE_TOKEN/);
});

test("database transport marks request setup failures before fetch", async () => {
  await assert.rejects(exports.databaseFetch("https://example.invalid", { signal: {} }));

  assert.equal(loggedErrors.length, 1);
  const [, details] = loggedErrors.pop();
  assert.equal(details.fetchStarted, false);
  assert.equal(details.errorName, "TypeError");
  assert.equal(details.causeCode, "other");
});
