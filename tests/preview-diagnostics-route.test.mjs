import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../app/api/internal/preview-diagnostics/route.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function loadRoute({ authorized = true, url = "https://epyifhlwdhzlpfpnavkg.supabase.co" } = {}) {
  const exports = {};
  const calls = { fetch: 0, client: 0, clientOptions: undefined };
  const env = {
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_REF: "feature/travel-requests-mvp",
    NEXT_PUBLIC_SUPABASE_URL: url,
    SUPABASE_SECRET_KEY: "qa-secret-placeholder",
  };
  vm.runInNewContext(javascript, {
    exports,
    process: { env },
    URL,
    URLSearchParams,
    AbortSignal,
    Date,
    Request,
    Response,
    fetch: async () => { calls.fetch += 1; return new Response(null, { status: 200 }); },
    require: (name) => {
      if (name === "@supabase/supabase-js") return {
        createClient: (clientUrl, key, options) => {
          calls.client += 1;
          calls.clientOptions = options;
          assert.equal(clientUrl, env.NEXT_PUBLIC_SUPABASE_URL);
          assert.equal(key, env.SUPABASE_SECRET_KEY);
          return {
            auth: { admin: { getUserById: async () => ({ data: { user: {
              id: "1f6e89ca-09f1-4d2c-a9ee-06bec72c8ac6", email: "kyrgyzstan360.tour@gmail.com",
            } }, error: null }) } },
            from: () => ({
              select() { return this; },
              eq() { return this; },
              maybeSingle: async () => ({ status: 200, data: { user_id: "1f6e89ca-09f1-4d2c-a9ee-06bec72c8ac6" }, error: null }),
            }),
          };
        },
      };
      if (name === "@/lib/admin/preview-diagnostics-guard") return {
        isAuthorizedPreviewDiagnostics: () => authorized,
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { route: exports, calls };
}

test("preview connectivity probe is closed without its guard and makes no outbound calls", async () => {
  const { route, calls } = loadRoute({ authorized: false });
  const response = await route.POST(new Request("https://preview.invalid/api/internal/preview-diagnostics", { method: "POST" }));
  assert.equal(response.status, 404);
  assert.equal(calls.fetch, 0);
  assert.equal(calls.client, 0);
});

test("preview connectivity probe uses standard Supabase SDK and returns only sanitized checks", async () => {
  const { route, calls } = loadRoute();
  const response = await route.POST(new Request("https://preview.invalid/api/internal/preview-diagnostics", { method: "POST" }));
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.connected, true);
  assert.equal(result.previewConfigurationMatches, true);
  assert.equal(result.authAdmin.status, 200);
  assert.equal(result.authAdmin.userMatches, true);
  assert.equal(result.postgrestStaffRead.status, 200);
  assert.equal(result.postgrestStaffRead.activeStaffFound, true);
  assert.equal(calls.client, 1);
  assert.equal(calls.clientOptions.global, undefined);
  assert.doesNotMatch(JSON.stringify(result), /qa-secret|1f6e89ca|kyrgyzstan360.tour@gmail.com/i);
});

test("probe refuses a client URL outside the exact Preview project", async () => {
  const { route, calls } = loadRoute({ url: "https://hrbibxosracivpvgzkyo.supabase.co" });
  const response = await route.POST(new Request("https://preview.invalid/api/internal/preview-diagnostics", { method: "POST" }));
  assert.equal(response.status, 503);
  assert.equal(calls.client, 0);
  assert.equal(calls.fetch, 0);
});
