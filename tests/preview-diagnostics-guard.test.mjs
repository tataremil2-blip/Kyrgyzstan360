import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/admin/preview-diagnostics-guard.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(javascript, {
  exports,
  require: () => ({ timingSafeEqual: (a, b) => a.length === b.length && a.every((value, i) => value === b[i]) }),
  Buffer,
  URL,
});

const env = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "feature/travel-requests-mvp",
  NEXT_PUBLIC_SUPABASE_URL: "https://epyifhlwdhzlpfpnavkg.supabase.co",
  CRON_SECRET: "qa-secret",
};

test("preview diagnostic requires branch, Preview project and matching bearer secret", () => {
  const request = (authorization) => new Request("https://preview.invalid/api/internal/preview-diagnostics", {
    method: "POST", headers: authorization ? { authorization } : {},
  });

  assert.equal(exports.isAuthorizedPreviewDiagnostics(request("Bearer qa-secret"), env), true);
  assert.equal(exports.isAuthorizedPreviewDiagnostics(request("Bearer wrong"), env), false);
  assert.equal(exports.isAuthorizedPreviewDiagnostics(request(), env), false);
  assert.equal(exports.isAuthorizedPreviewDiagnostics(request("Bearer qa-secret"), { ...env, VERCEL_ENV: "production" }), false);
  assert.equal(exports.isAuthorizedPreviewDiagnostics(request("Bearer qa-secret"), { ...env, VERCEL_GIT_COMMIT_REF: "main" }), false);
  assert.equal(exports.isAuthorizedPreviewDiagnostics(request("Bearer qa-secret"), { ...env, NEXT_PUBLIC_SUPABASE_URL: "https://hrbibxosracivpvgzkyo.supabase.co" }), false);
});
