import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../app/admin/actions.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const requestId = "2d9d182f-17b0-480b-8e5a-3d4d517cd2c8";

function loadActions({ authError = null, user = { id: "staff-user" }, staffData = { user_id: "staff-user" }, rpcError = null } = {}) {
  const exports = {};
  const effects = { signedOut: [], rpc: [], revalidated: [], deletedCookies: [] };
  const jar = {
    getAll: () => [
      { name: "sb-preview-auth-token", value: "session-placeholder" },
      { name: "unrelated-cookie", value: "keep" },
    ],
    delete: (name) => effects.deletedCookies.push(name),
  };
  const supabase = { auth: {
    signInWithPassword: async () => authError ? { data: {}, error: authError } : { data: { user }, error: null },
    signOut: async (options) => { effects.signedOut.push(options.scope); return { error: null }; },
  } };
  const db = {
    from: (table) => {
      assert.equal(table, "staff_members");
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => ({ data: staffData, error: null }),
      };
      return query;
    },
    rpc: async (name, args) => { effects.rpc.push({ name, args }); return { error: rpcError }; },
  };
  vm.runInNewContext(javascript, {
    exports,
    require: (name) => {
      if (name === "next/headers") return { cookies: async () => jar };
      if (name === "next/navigation") return { redirect: (path) => { throw new Error(`REDIRECT:${path}`); } };
      if (name === "next/cache") return { revalidatePath: (path) => effects.revalidated.push(path) };
      if (name === "@/lib/admin/auth") return {
        authClient: async () => supabase,
        requireStaff: async () => ({ user_id: "staff-user", display_name: "Test staff" }),
        safeAdminPath: (value) => value === "/admin" ? value : "/admin",
      };
      if (name === "@/lib/travel-requests/database") return { database: () => db };
      if (name === "@/lib/travel-requests/notifications") return { deliverTripNotifications: async () => {} };
      if (name === "@/lib/travel-requests/validation") return {
        statuses: ["new", "contacted", "planning", "proposal_sent", "negotiating", "booked", "completed", "lost", "cancelled"],
        uuidPattern: /^[0-9a-f-]{36}$/i,
      };
      throw new Error(`Unexpected import: ${name}`);
    },
    process: { env: {} },
    console: { error: () => {} },
  });
  return { actions: exports, effects };
}

test("CRM login accepts valid Auth credentials only after the active staff check", async () => {
  const { actions, effects } = loadActions();
  const form = new FormData();
  form.set("email", "staff@example.invalid");
  form.set("password", "test-password");
  await assert.rejects(actions.login(form), /REDIRECT:\/admin$/);
  assert.deepEqual(effects.signedOut, []);
});

test("wrong password and inactive staff both return to login and close a denied session", async () => {
  const form = new FormData();
  form.set("email", "staff@example.invalid");
  form.set("password", "wrong-test-password");
  const rejected = loadActions({ authError: { code: "invalid_credentials", status: 400 } });
  await assert.rejects(rejected.actions.login(form), /REDIRECT:\/admin\/login\?error=1$/);
  assert.deepEqual(rejected.effects.signedOut, []);

  const inactive = loadActions({ staffData: null });
  await assert.rejects(inactive.actions.login(form), /REDIRECT:\/admin\/login\?error=1$/);
  assert.deepEqual(inactive.effects.signedOut, ["local"]);
});

test("logout clears the current Supabase cookie and returns to login", async () => {
  const { actions, effects } = loadActions();
  await assert.rejects(actions.logout(), /REDIRECT:\/admin\/login$/);
  assert.deepEqual(effects.signedOut, ["local"]);
  assert.deepEqual(effects.deletedCookies, ["sb-preview-auth-token"]);
});

test("request status and note updates use the guarded RPC and revalidate CRM data", async () => {
  const { actions, effects } = loadActions();
  const form = new FormData();
  form.set("status", "planning");
  form.set("manager", "");
  form.set("note", "Reviewed with the guest");
  await assert.rejects(actions.updateRequest(requestId, form), new RegExp(`REDIRECT:/admin/requests/${requestId}\\?result=saved`));
  assert.equal(effects.rpc.length, 1);
  assert.equal(effects.rpc[0].name, "update_travel_request");
  assert.equal(effects.rpc[0].args.p_status, "planning");
  assert.equal(effects.rpc[0].args.p_note, "Reviewed with the guest");
  assert.deepEqual(effects.revalidated, ["/admin"]);
});

test("invalid request status is rejected without calling the database RPC", async () => {
  const { actions, effects } = loadActions();
  const form = new FormData();
  form.set("status", "admin");
  form.set("manager", "");
  form.set("note", "");
  await assert.rejects(actions.updateRequest(requestId, form), new RegExp(`REDIRECT:/admin/requests/${requestId}\\?result=error`));
  assert.equal(effects.rpc.length, 0);
});
