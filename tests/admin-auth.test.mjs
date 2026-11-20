import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/admin/auth.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exports = {};
vm.runInNewContext(javascript, {
  exports,
  require: (name) => {
    if (name === "next/headers" || name === "next/navigation" || name === "@/lib/travel-requests/database") return {};
    if (name === "@supabase/ssr") return { createServerClient: () => ({}) };
    throw new Error("Unexpected import " + name);
  },
});

test("only local CRM paths can be used as post-auth redirects", () => {
  for (const path of ["/admin", "/admin/requests/123", "/admin?status=new"]) {
    assert.equal(exports.isSafeAdminPath(path), true);
    assert.equal(exports.safeAdminPath(path), path);
  }
  for (const path of [
    null, "", "/", "//evil.example", "/administer", "/admin%2f..",
    "/admin/auth/callback", "https://evil.example", "/admin\\evil.example", "/admin\r\nLocation:https://evil.example",
  ]) {
    assert.equal(exports.isSafeAdminPath(path), false, String(path));
    assert.equal(exports.safeAdminPath(path), "/admin");
  }
});


