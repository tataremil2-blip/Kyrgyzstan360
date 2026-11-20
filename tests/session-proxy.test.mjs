import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/admin/session-proxy.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function loadProxy() {
  const exports = {};
  const writes = [];
  let tableReads = 0;
  const client = {
    auth: {
      getUser: async () => {
        cookieAdapter.setAll([{ name: "sb-preview-auth-token", value: "refreshed-placeholder", options: { httpOnly: true } }], {});
        return { data: { user: { id: "test-user" } }, error: null };
      },
    },
    from: () => { tableReads += 1; throw new Error("Proxy must not query membership"); },
  };
  let cookieAdapter;
  const response = () => ({
    headers: new Map(),
    cookies: { set: (...args) => writes.push(args), getAll: () => [] },
    headers: { set(name, value) { this[name] = value; } },
  });
  vm.runInNewContext(javascript, {
    exports,
    require: (name) => name === "next/server"
      ? { NextResponse: { next: response, redirect: () => { throw new Error("Unexpected redirect"); } } }
      : name === "@supabase/ssr"
        ? { createServerClient: (_url, _key, options) => { cookieAdapter = options.cookies; return client; } }
        : (() => { throw new Error(`Unexpected import: ${name}`); })(),
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://preview.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "qa-placeholder", NODE_ENV: "production" } },
    URL,
  });
  return { proxy: exports, writes, getTableReads: () => tableReads };
}

test("session proxy refreshes SSR cookies without querying staff_members", async () => {
  const { proxy, writes, getTableReads } = loadProxy();
  const requestCookies = [];
  const result = await proxy.updateAuthSession({
    url: "https://preview.invalid/admin",
    nextUrl: { pathname: "/admin" },
    cookies: { getAll: () => [], set: (...args) => requestCookies.push(args) },
  });

  assert.equal(result.headers["Cache-Control"], "private, no-store");
  assert.equal(getTableReads(), 0);
  assert.equal(writes.length, 1);
  assert.equal(requestCookies.length, 1);
  assert.equal(writes[0][2].httpOnly, true);
});
