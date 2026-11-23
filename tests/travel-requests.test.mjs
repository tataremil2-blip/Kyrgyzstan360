import test from "node:test";
import assert from "node:assert/strict";
import { validate } from "../lib/travel-requests/validation.ts";

const request = {
  countries: ["UZ", "KG", "KZ"],
  interests: ["hiking", "nature"],
  flexible: true, startDate: "", endDate: "",
  adults: 2, children: 0, budget: 2500.50,
  name: " Test Guest ", email: "guest@example.com", contact: "email",
  consent: true, locale: "ru", utm: { utm_source: " test ", unexpected: "discard me" },
};

test("normalizes a valid multi-country request and retains only allowed attribution fields", () => {
  const { data, errors } = validate(request);
  assert.deepEqual(errors, []);
  assert.deepEqual(data.countries, ["KG", "KZ", "UZ"]);
  assert.equal(data.startDate, null);
  assert.equal(data.name, "Test Guest");
  assert.deepEqual(data.utm, { utm_source: "test" });
});

test("rejects missing Kyrgyzstan, unknown destinations, invalid numbers and missing consent", () => {
  assert.deepEqual(validate({
    ...request, countries: ["UZ", "US"], adults: "2", children: -1, budget: 1.005, consent: false,
  }).errors, ["countries", "travelers", "budget", "consent"]);
});

test("fixed dates require a complete, real, ordered range; flexible dates allow blanks", () => {
  assert.ok(validate({ ...request, flexible: false }).errors.includes("dates"));
  assert.ok(validate({ ...request, startDate: "2099-02-29", endDate: "2099-03-03" }).errors.includes("dates"));
  assert.ok(validate({ ...request, startDate: "2099-03-03", endDate: "2099-03-01" }).errors.includes("dates"));
  assert.ok(validate({ ...request, startDate: "2099-03-03" }).errors.includes("dates"));
  assert.deepEqual(validate({ ...request, flexible: false, startDate: "2099-03-01", endDate: "2099-03-03" }).errors, []);
});

test("accepts Afghanistan, an approximate period, and an empty budget without reusing Turkmenistan", () => {
  const approximate = validate({ ...request, countries: ["KG", "KZ", "AF"], dateMode: "approximate", flexible: false,
    preferredPeriod: "2027-09", startDate: "", endDate: "", budget: null });
  assert.deepEqual(approximate.errors, []);
  assert.deepEqual(approximate.data.countries, ["KG", "KZ", "AF"]);
  assert.equal(approximate.data.preferredPeriod, "2027-09");
  assert.equal(approximate.data.budget, null);
  assert.ok(validate({ ...request, countries: ["KG", "TM"] }).errors.includes("countries"));
});

test("keeps flexible dates truly empty and rejects hidden date values", () => {
  assert.deepEqual(validate({ ...request, dateMode: "flexible", budget: null }).errors, []);
  assert.ok(validate({ ...request, dateMode: "flexible", startDate: "2099-03-01" }).errors.includes("dates"));
});

test("WhatsApp and Telegram each require their own contact channel", () => {
  assert.ok(validate({ ...request, contact: "whatsapp", telegram: "@test_guest" }).errors.includes("contact"));
  assert.ok(validate({ ...request, contact: "telegram", phone: "+996 555 111 222" }).errors.includes("contact"));
  assert.deepEqual(validate({ ...request, contact: "whatsapp", phone: "+996 555 111 222" }).errors, []);
  assert.deepEqual(validate({ ...request, contact: "telegram", telegram: "@test_guest" }).errors, []);
});

test("the first step can be completed without filling later fields", () => {
  assert.deepEqual(validate({ countries: ["KG"] }, 1).errors, []);
});
