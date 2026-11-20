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
vm.runInNewContext(javascript, {
  exports,
  require: () => ({ createClient: () => ({}) }),
  AbortSignal,
  fetch: async (_input, init) => init,
});

test("database fetch forwards SDK cancellation and also has a bounded timeout", async () => {
  const controller = new AbortController();
  const timeoutController = new AbortController();
  const requestInit = {
    method: "GET",
    headers: { accept: "application/json" },
    signal: controller.signal,
  };

  const forwarded = exports.databaseFetchOptions(requestInit, timeoutController.signal);

  assert.equal(forwarded.method, "GET");
  assert.equal(forwarded.headers, requestInit.headers);
  assert.equal(forwarded.cache, "no-store");
  assert.ok(forwarded.signal);
  assert.equal(forwarded.signal.aborted, false);

  controller.abort();
  assert.equal(forwarded.signal.aborted, true);

  const bounded = exports.databaseFetchOptions(undefined, timeoutController.signal);
  assert.equal(bounded.signal.aborted, false);
  timeoutController.abort();
  assert.equal(bounded.signal.aborted, true);
});
