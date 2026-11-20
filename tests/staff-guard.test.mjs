import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/admin/auth.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function loadAuth({ staffData, staffError = null, authUser = { id: "staff-user" }, authError = null }) {
  const exports = {};
  const lookups = [];
  const cookieJar = { getAll: () => [], set: () => {} };
  const databaseClient = {
    from(table) {
      assert.equal(table, "staff_members");
      const query = {
        select(columns) { lookups.push({ table, columns }); return query; },
        eq(column, value) { lookups.at(-1)[column] = value; return query; },
        maybeSingle: async () => ({ data: staffData, error: staffError }),
      };
      return query;
    },
  };
  vm.runInNewContext(javascript, {
    exports,
    require: (name) => {
      if (name === "next/headers") return { cookies: async () => cookieJar };
      if (name === "next/navigation") return { redirect: (path) => { throw new Error(`REDIRECT:${path}`); } };
      if (name === "@supabase/ssr") return { createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: authUser }, error: authError }) } }) };
      if (name === "@/lib/travel-requests/database") return { database: () => databaseClient };
      throw new Error(`Unexpected import: ${name}`);
    },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://preview.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "qa-placeholder" } },
  });
  return { auth: exports, lookups };
}

test("server staff guard allows an active membership and performs an explicit active check", async () => {
  const { auth, lookups } = loadAuth({ staffData: { user_id: "staff-user", display_name: "Test staff" } });
  const staff = await auth.requireStaff();
  assert.equal(staff.user_id, "staff-user");
  assert.equal(staff.display_name, "Test staff");
  assert.deepEqual(lookups, [{ table: "staff_members", columns: "user_id,display_name", user_id: "staff-user", active: true }]);
});

test("server staff guard rejects inactive or unavailable membership", async () => {
  for (const result of [{ staffData: null }, { staffData: null, staffError: { code: "denied" } }]) {
    const { auth } = loadAuth(result);
    await assert.rejects(auth.requireStaff(), /REDIRECT:\/admin\/login/);
  }
});

test("server staff guard rejects an expired or missing Auth session before querying staff", async () => {
  const { auth, lookups } = loadAuth({ authUser: null, authError: { code: "session_expired" }, staffData: null });
  await assert.rejects(auth.requireStaff(), /REDIRECT:\/admin\/login/);
  assert.equal(lookups.length, 0);
});
