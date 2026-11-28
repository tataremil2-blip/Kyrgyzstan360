import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const directory = new URL("../app/[lang]/", import.meta.url);
const files = ["browser-preferences", "analytics-attribution", "analytics"];
const modules = Object.fromEntries(files.map((name) => [
  name,
  ts.transpileModule(readFileSync(new URL(`${name}.ts`, directory), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
]));

const origin = "https://www.kyrgyzstan360.com";
const click = "CjwKCAiA_TESTclick_123456789";
const reference = "WEB-2D6A01BD79B492FC";

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function setup({ search = "", measurementId = "G-TESTANALYTICS", session = storage() } = {}) {
  const local = storage();
  const scripts = [];
  const window = { location: new URL(`${origin}/en${search}`) };
  const document = {
    referrer: "https://www.google.com/search?q=private+search",
    title: "Private browser title",
    createElement: () => ({}),
    head: { append: (element) => scripts.push(element) },
  };
  const exports = {};
  for (const name of files) {
    exports[name] = {};
    vm.runInNewContext(modules[name], {
      exports: exports[name], URL, window, document, localStorage: local, sessionStorage: session,
      process: { env: {
        NEXT_PUBLIC_GA_MEASUREMENT_ID: measurementId,
        NEXT_PUBLIC_GA_UTM_ALLOWLIST: JSON.stringify({ utm_campaign: ["summer-2027"] }),
      } },
      require: (id) => exports[id.replace(/^\.\//, "")],
    });
  }
  const consent = (choice) => choice
    ? local.setItem(exports["browser-preferences"].cookieConsentKey, choice)
    : local.removeItem(exports["browser-preferences"].cookieConsentKey);
  const events = (name) => (window.dataLayer ?? [])
    .filter((args) => args[0] === "event" && (!name || args[1] === name))
    .map((args) => args[2]);
  const navigate = (path) => { window.location = new URL(path, origin); };
  return { ...exports.analytics, consent, navigate, events, scripts, session, window };
}

test("no GA tag, hits or attribution storage without opt-in or a configured measurement ID", () => {
  const a = setup({ search: `?gclid=${click}&utm_source=google` });
  a.syncPublicAnalytics();
  a.trackPublicEvent("build_your_adventure_click", "en");
  a.trackAcceptedTripRequest(201, { reference, replayed: false }, "en");
  a.consent("rejected");
  a.syncPublicAnalytics();
  assert.equal(a.scripts.length, 0);
  assert.equal(a.events().length, 0);
  assert.equal(a.session.getItem("k360-analytics-attribution-v1"), null);

  const unconfigured = setup({ measurementId: "" });
  unconfigured.consent("accepted");
  unconfigured.syncPublicAnalytics();
  assert.equal(unconfigured.scripts.length, 0);
});

test("analytics opt-in sends manual views with only approved campaign and public-source values", () => {
  const a = setup({ search: `?gclid=${click}&utm_source=google&utm_campaign=summer-2027&utm_term=Jane-Smith&email=jane@example.net&phone=01234567890` });
  a.syncPublicAnalytics();
  a.consent("accepted");
  a.syncPublicAnalytics();
  a.syncPublicAnalytics();
  assert.equal(a.scripts.length, 1);
  assert.equal(a.scripts[0].referrerPolicy, "no-referrer");
  let views = a.events("page_view");
  assert.equal(views.length, 1);
  assert.equal(views[0].page_location, `${origin}/en?utm_source=google&utm_campaign=summer-2027`);
  assert.equal(views[0].page_referrer, "https://www.google.com/");
  const commands = a.window.dataLayer.map((args) => Array.from(args));
  assert.equal(commands.find((args) => args[0] === "config")[2].send_page_view, false);
  assert.equal(commands.find((args) => args[0] === "consent" && args[1] === "update")[2].ad_user_data, "denied");
  assert(!JSON.stringify(commands).match(/Jane|private|example\.net|012345|Private browser title|CjwK/));

  a.trackPublicEvent("build_your_adventure_click", "en");
  a.navigate("/en/plan-your-trip?trip=private+request+note");
  a.syncPublicAnalytics();
  views = a.events("page_view");
  assert.equal(views.length, 2);
  assert.equal(views[1].page_location, `${origin}/en/plan-your-trip?utm_source=google&utm_campaign=summer-2027`);
  assert.equal(views[1].landing_path, "/en");
  assert.equal(views[1].page_referrer, `${origin}/en`);
  assert.equal(a.events("build_your_adventure_click").length, 1);
});

test("separate ad-attribution opt-in preserves the click ID across full navigation and revocation clears it", () => {
  const a = setup({ search: `?gclid=${click}` });
  a.consent("accepted-attribution");
  a.syncPublicAnalytics();
  assert.equal(new URL(a.events("page_view")[0].page_location).searchParams.get("gclid"), click);
  const b = setup({ session: a.session });
  b.navigate("/ru/plan-your-trip?secret=ignored");
  b.consent("accepted-attribution");
  b.syncPublicAnalytics();
  assert.equal(new URL(b.events("page_view")[0].page_location).searchParams.get("gclid"), click);
  assert.equal(b.events("page_view")[0].landing_path, "/en");
  b.consent(undefined);
  b.syncPublicAnalytics();
  b.trackPublicEvent("build_your_adventure_click", "ru");
  assert.equal(b.events().length, 1);
  assert.equal(b.window["ga-disable-G-TESTANALYTICS"], true);
  assert.equal(b.session.getItem("k360-analytics-attribution-v1"), null);
});

test("only a 201 fresh accepted lead counts once and its reference stays out of GA4", () => {
  const a = setup();
  a.consent("accepted");
  a.navigate("/en/plan-your-trip");
  a.trackAcceptedTripRequest(503, { reference, replayed: false }, "en");
  a.trackAcceptedTripRequest(201, { reference, replayed: true }, "en");
  a.trackAcceptedTripRequest(201, { reference }, "en");
  assert.equal(a.events("trip_request_conversion").length, 0);
  a.trackAcceptedTripRequest(201, { reference, replayed: false }, "en");
  a.trackAcceptedTripRequest(201, { reference, replayed: false }, "en");
  assert.equal(a.events("trip_request_conversion").length, 1);
  assert(!JSON.stringify(a.window.dataLayer).includes(reference));
});

test("dynamic URLs and later referrers cannot disclose arbitrary path segments", () => {
  const a = setup();
  a.consent("accepted");
  a.navigate("/en/tours/private-customer-slug");
  a.syncPublicAnalytics();
  a.navigate("/en/plan-your-trip");
  a.syncPublicAnalytics();
  const views = a.events("page_view");
  assert.equal(views[0].page_location, `${origin}/en/tours/detail`);
  assert.equal(views[1].page_referrer, `${origin}/en/tours/detail`);
  assert(!JSON.stringify(a.window.dataLayer).includes("private-customer-slug"));
  a.navigate("/en/account");
  a.syncPublicAnalytics();
  assert.equal(a.events("page_view").length, 2);
});
