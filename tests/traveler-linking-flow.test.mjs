import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const preview = "https://preview.example.invalid";
const email = "traveler@example.invalid";
const verified = { id: "traveler-a", email, email_confirmed_at: "2026-11-24T00:00:00Z" };

function load(path, dependencies) {
  const exports = {};
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } });
  vm.runInNewContext(outputText, {
    exports, URL, Headers,
    process: { env: { APP_BASE_URL: preview, NEXT_PUBLIC_SUPABASE_URL: "https://test.example.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-only" } },
    require(name) {
      if (name === "react" || name === "react/jsx-runtime") return require(name);
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

function Link({ prefetch, ...props }) {
  if (props.href === "/account") assert.notEqual(prefetch, true);
  return createElement("a", props);
}

test("receipt links use the normal account and localized home routes with no resubmission", () => {
  const Receipt = load("app/[lang]/plan-your-trip/TripRequestSuccess.tsx", { "next/link": Link }).default;
  for (const locale of ["en", "ru"]) {
    const html = renderToStaticMarkup(createElement(Receipt, { locale, reference: "K360-TEST" }));
    assert.match(html, /href="\/account\/register"/);
    assert.match(html, /href="\/account"/);
    assert.ok(html.includes(`href="/${locale}"`));
    assert.match(html, locale === "en" ? /Your adventure starts here!/ : /Ваше приключение начинается здесь!/);
    assert.match(html, /K360-TEST/);
    assert.doesNotMatch(html, /<form|type="submit"|href="[^"]*\?/);
  }
});

function mockTravelerFlow() {
  const rows = [
    { id: "first", reference_number: "K360-ORIGINAL", customer_email: "Traveler@example.invalid", traveler_user_id: null,
      countries: ["KG"], start_date: "2027-07-01", end_date: "2027-07-08", adults: 2, children: 1,
      budget: 1250, details: { preferences: "A yurt stay & a short hike." }, status: "new" },
    { id: "late", reference_number: "K360-EARLIER", customer_email: email, traveler_user_id: null,
      created_at: "2026-11-17T00:00:00Z", status: "planning" },
    { id: "foreign", reference_number: "K360-FOREIGN", customer_email: email, traveler_user_id: "traveler-b", status: "new" },
    { id: "other", reference_number: "K360-UNCLAIMED", customer_email: "other@example.invalid", traveler_user_id: null, status: "new" },
  ];
  const redirects = (path) => { throw new Error(`Redirect to ${path}`); };
  const calls = [];
  let currentUser = null;
  const database = () => ({
    async rpc(name, args) {
      assert.equal(name, "claim_traveler_requests");
      calls.push({ kind: "claim", actor: args.p_actor, email: args.p_email });
      const eligible = rows.filter((row) => row.traveler_user_id === null && row.customer_email.toLowerCase() === args.p_email.trim().toLowerCase());
      eligible.forEach((row) => { row.traveler_user_id = args.p_actor; });
      return { data: eligible.length, error: null };
    },
    from(table) {
      assert.equal(table, "travel_requests");
      return { select: () => ({ eq: (column, id) => {
        assert.equal(column, "traveler_user_id");
        assert.equal(id, currentUser.id);
        calls.push({ kind: "list", actor: id });
        return { order: async () => ({ data: rows.filter((row) => row.traveler_user_id === id), error: null }) };
      } }) };
    },
  });
  const auth = {
    async getUser() { return { data: { user: currentUser }, error: null }; },
    async signUp({ email: address, options }) {
      assert.equal(address, email);
      assert.equal(options.emailRedirectTo, `${preview}/account/auth/callback`);
      currentUser = { ...verified, email_confirmed_at: null };
      return { error: null };
    },
    async exchangeCodeForSession(code) {
      assert.equal(code, "mock-confirmed-email-code");
      currentUser = verified;
      return { error: null };
    },
    async signInWithPassword({ email: address }) {
      currentUser = { ...verified, id: address === email ? verified.id : "traveler-c", email: address };
      return { data: { user: currentUser }, error: null };
    },
  };
  const databaseModule = { database };
  const nextHeaders = { cookies: async () => ({ getAll: () => [] }) };
  const nextServer = { NextResponse: { redirect: (url) => ({ url, headers: new Headers() }) } };
  const supabase = { createServerClient: () => ({ auth }) };
  const validation = { formatCountries: (countries) => countries.includes("KG") ? "Kyrgyzstan" : "Not specified" };
  const accountAuth = load("lib/account/auth.ts", {
    "@supabase/ssr": supabase, "next/headers": nextHeaders, "next/navigation": { redirect: redirects },
    "@/lib/travel-requests/database": databaseModule, "@/lib/travel-requests/validation": validation,
  });
  const actions = load("app/account/actions.ts", {
    "next/headers": nextHeaders, "next/server": nextServer, "next/cache": {}, "next/navigation": { redirect: redirects },
    "@/lib/account/auth": accountAuth, "@/lib/travel-requests/database": databaseModule,
    "@/lib/travel-requests/notifications": { deliverTripNotifications: () => assert.fail("Linking cannot send notifications") },
    "@/lib/travel-requests/validation": validation,
  });
  const account = load("app/account/page.tsx", {
    "next/link": Link, "@/lib/account/auth": accountAuth, "@/lib/travel-requests/database": databaseModule,
    "@/lib/travel-requests/validation": validation, "./actions": actions,
  });
  const callback = load("app/account/auth/callback/route.ts", { "@supabase/ssr": supabase, "next/server": nextServer });
  return { rows, calls, actions, callback, account, setUser: (user) => { currentUser = user; } };
}

function credentials(address = email) {
  const form = new FormData();
  form.set("email", address);
  form.set("password", "mock-password-only");
  return form;
}

test("signup and verification claim matching original requests once, before rendering My Trips", async () => {
  const { rows, calls, actions, account, callback } = mockTravelerFlow();
  await assert.rejects(account.default(), /Redirect to \/account\/login/);
  assert.equal(calls.length, 0);

  await assert.rejects(actions.registerTraveler(credentials()), /Redirect to \/account\/login\?checkEmail=1/);
  assert.match(renderToStaticMarkup(await account.default()), /No trips yet/);
  assert.equal(calls.some((call) => call.kind === "claim"), false);

  const callbackUrl = new URL(`${preview}/account/auth/callback?code=mock-confirmed-email-code`);
  const response = await callback.GET({ url: callbackUrl.href, nextUrl: callbackUrl, cookies: { getAll: () => [] } });
  assert.equal(response.url.href, `${preview}/account`);
  const html = renderToStaticMarkup(await account.default());
  assert.match(html, /K360-ORIGINAL/);
  assert.match(html, /K360-EARLIER/);
  assert.match(html, /Your Kyrgyzstan Trip/);
  assert.match(html, /Request received/);
  assert.match(html, /2027-07-01 – 2027-07-08 · 3 travelers · USD 1250 per person/);
  assert.match(html, /A yurt stay &amp; a short hike\./);
  assert.doesNotMatch(html, /K360-FOREIGN|K360-UNCLAIMED/);
  assert.deepEqual(calls.slice(-2).map(({ kind }) => kind), ["claim", "list"]);

  const again = renderToStaticMarkup(await account.default());
  assert.equal(again.match(/K360-ORIGINAL/g)?.length, 1);
  assert.equal(rows.length, 4);
  assert.equal(rows[2].traveler_user_id, "traveler-b");
  assert.equal(rows[3].traveler_user_id, null);
});

test("an existing or signed-in traveler claims later requests only for the verified email", async () => {
  const { rows, actions, account, setUser } = mockTravelerFlow();
  await assert.rejects(actions.loginTraveler(credentials("different@example.invalid")), /Redirect to \/account/);
  assert.match(renderToStaticMarkup(await account.default()), /No trips yet/);
  assert.equal(rows[0].traveler_user_id, null);

  await assert.rejects(actions.loginTraveler(credentials()), /Redirect to \/account/);
  assert.match(renderToStaticMarkup(await account.default()), /K360-ORIGINAL/);
  setUser(verified);
  rows.push({ id: "signed-in", reference_number: "K360-SIGNED-IN", customer_email: email, traveler_user_id: null, status: "new" });
  assert.match(renderToStaticMarkup(await account.default()), /K360-SIGNED-IN/);
  assert.equal(rows.at(-1).traveler_user_id, verified.id);
});
