import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';

function loadTypeScript(relative, runtime = {}) {
  const url = new URL(relative, import.meta.url);
  const code = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: createRequire(url), Intl, ...runtime });
  return exports;
}
const { createTranslator } = loadTypeScript('../lib/translate.ts');
const { formatDepartureLabel } = loadTypeScript('../lib/formatting.ts');
const { parseTripDraft, exampleItinerary, defaultTripDraft, suggestedDays } = loadTypeScript('../lib/planner.ts');
const { adviseRoute } = loadTypeScript('../lib/route-advisor.ts');
const { validateItinerary } = loadTypeScript('../lib/itinerary-validator.ts');

test('adventure choices migrate old drafts and reject unknown destinations', () => {
  const old = parseTripDraft(JSON.stringify({ version: 1, guests: 4, month: '2027-06' }));
  assert.equal(old.guests, 4);
  assert.equal(old.destinations.join(','), 'issyk-kul,kel-suu,altyn-arashan');
  assert.equal(suggestedDays(old.destinations), 5);
  const saved = parseTripDraft(JSON.stringify({ ...old, destinations: ['osh', 'osh', 'unknown'], experiences: ['springs', 'bad'], travelStyle: 'premium' }));
  assert.equal(saved.destinations.join(','), 'osh');
  assert.equal(saved.experiences.join(','), 'springs');
  assert.equal(Object.hasOwn(saved, 'travelStyle'), false);
  assert.equal(suggestedDays(saved.destinations), 2);
  assert.equal(suggestedDays([]), 0);
  assert.equal(parseTripDraft(JSON.stringify({ ...old, destinations: [] })).destinations.length, 0);
});

test('airport endpoints persist independently and hidden country destinations are removed', () => {
  const draft = parseTripDraft(JSON.stringify({ ...defaultTripDraft, arrivalAirport: 'almaty', departureAirport: 'tashkent', countries: ['kg', 'kz', 'uz', 'unknown'] }));
  assert.equal(draft.arrivalAirport, 'almaty');
  assert.equal(draft.departureAirport, 'tashkent');
  assert.equal(draft.countries.join(','), 'kg,kz,uz');
  const withoutKg = parseTripDraft(JSON.stringify({ ...draft, countries: ['uz'], arrivalAirport: 'invalid' }));
  assert.equal(withoutKg.destinations.length, 0);
  assert.equal(withoutKg.arrivalAirport, '');
  assert.equal(withoutKg.departureAirport, 'tashkent');
  const legacy = parseTripDraft(JSON.stringify({ version: 1 }));
  assert.equal(legacy.arrivalAirport, '');
  assert.equal(legacy.departureAirport, '');
  assert.equal(legacy.countries.join(','), 'kg');
});

test('free-form trip description is preserved and bounded', () => {
  const saved = parseTripDraft(JSON.stringify({ ...defaultTripDraft, freeText: '8 дней, Бишкек → Алматы, юрта и орлы' }));
  assert.equal(saved.freeText, '8 дней, Бишкек → Алматы, юрта и орлы');
  const bounded = parseTripDraft(JSON.stringify({ ...defaultTripDraft, freeText: 'x'.repeat(5000) }));
  assert.equal(bounded.freeText.length, 4000);
});

test('route advisor flags incomplete and dense drafts', () => {
  const messages = adviseRoute({ selectedPlaceCount: 4, knownPlaceDays: 8, unknownPlaceCount: 1, selectedCountryCount: 2, tripDays: 6, hasArrival: false, hasDeparture: true });
  assert.equal(Array.from(messages, (item) => item.key).join(','), 'airports,unknownDuration,borders,tooDense');
  assert.equal(adviseRoute({ selectedPlaceCount: 0, knownPlaceDays: 0, unknownPlaceCount: 0, selectedCountryCount: 1, tripDays: 8, hasArrival: true, hasDeparture: true })[0].key, 'empty');
});

test('itinerary validator rejects unsafe draft structure', () => {
  const valid = [{ day: 1, title: 'Bishkek', placeId: 'bishkek', activities: ['walk'], overnightPlaceId: 'bishkek' }, { day: 2, title: 'Karakol', placeId: 'karakol', activities: ['lake'], overnightPlaceId: null }];
  assert.equal(validateItinerary(valid, 2).length, 0);
  assert.equal(validateItinerary([{ ...valid[0], day: 2 }], 2).includes('day-1-sequence'), true);
  assert.equal(validateItinerary(valid, 1).includes('too-many-days'), true);
});


test('Russian messages support interpolation and preserve monetary amounts', () => {
  const ru = createTranslator('ru');
  assert.equal(ru('DAY {day}', { day: '03' }), 'ДЕНЬ 03');
  assert.equal(ru('€1,900').replace(/\s/g, ''), '1900€');
  assert.equal(ru('$1,800').replace(/\s/g, ''), '1800$');
  assert.equal(ru('Please complete the required fields.'), 'Заполните обязательные поля.');
  assert.equal(createTranslator('en')('€1,900'), '€1,900');
});
test('translations keep React values and unknown guest content intact', () => {
  const element = { type: 'p', props: { children: 'Guest text' } };
  assert.equal(createTranslator('ru')(element), element);
  assert.equal(createTranslator('ru')('A guest wrote this.'), 'A guest wrote this.');
  assert.equal(createTranslator('en')('Terms &amp; Conditions'), 'Terms & Conditions');
});
test('cross-month departure labels retain their dates', () => {
  assert.equal(formatDepartureLabel('30 Jun — 07 Jul 2027', 'ru'), '30 июня — 07 июля 2027');
  assert.equal(formatDepartureLabel('01 — 08 May 2027', 'ru'), '01 — 08 мая 2027');
});

test('planner restores valid drafts while rejecting corrupt or unsupported values', () => {
  const saved = parseTripDraft(JSON.stringify({ ...defaultTripDraft, days: 12, guests: 4, month: '2027-06', showResult: true }));
  assert.equal(saved.days, 12);
  assert.equal(saved.guests, 4);
  assert.equal(saved.month, '2027-06');
  assert.equal(saved.showResult, true);
  const invalid = parseTripDraft(JSON.stringify({ version: 1, days: 999, guests: -4, month: 'invalid', interests: ['injected'], transport: 'unknown' }));
  assert.equal(invalid.days, 8);
  assert.equal(invalid.guests, 2);
  assert.equal(invalid.month, '');
  assert.equal(invalid.interests.length, 0);
  assert.equal(invalid.transport, 'driver');
  assert.equal(parseTripDraft('{broken').days, 8);
});
test('every sample duration has exactly that many bilingual days and returns to Bishkek', () => {
  for (const days of [6, 8, 12]) {
    const route = exampleItinerary(days);
    assert.equal(route.length, days);
    assert.match(route.at(-1).title.en, /Bishkek/);
    for (const day of route) {
      assert.ok(day.title.en && day.title.ru && day.description.en && day.description.ru);
    }
  }
});

test('inquiry API includes language and itinerary without contacting a real mail service', async () => {
  let sent;
  const { POST } = loadTypeScript('../app/api/inquiries/route.ts', {
    require: () => ({ createTranslator }),
    process: { env: { RESEND_API_KEY: 'test-only', RESEND_FROM_EMAIL: 'test@example.invalid' } },
    Response, AbortSignal,
    fetch: async (_url, options) => { sent = JSON.parse(options.body); return new Response('{}', { status: 200 }); },
  });
  const message = 'ПРИМЕР ПРОГРАММЫ\n1. Бишкек → Сон-Куль\n2. Сон-Куль → Нарын';
  const result = await POST(new Request('http://localhost/api/inquiries', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ru' },
    body: JSON.stringify({ name: 'Test traveller', email: 'test@example.invalid', whatsapp: '+000000000', tour: 'Custom trip planner (example)', message }),
  }));
  assert.equal(result.status, 200);
  assert.ok(sent.text.includes('Language: ru'));
  assert.ok(sent.text.includes(message));
  assert.ok(sent.html.includes('Бишкек'));
});

test('invalid inquiries return Russian validation messages without sending mail', async () => {
  const { POST } = loadTypeScript('../app/api/inquiries/route.ts', {
    require: () => ({ createTranslator }),
    process: { env: { RESEND_API_KEY: 'test-only', RESEND_FROM_EMAIL: 'test@example.invalid' } },
    Response, AbortSignal,
    fetch: async () => { throw new Error('Validation must stop before email'); },
  });
  const result = await POST(new Request('http://localhost/api/inquiries', { method: 'POST', headers: { 'Accept-Language': 'ru' }, body: '{}' }));
  assert.equal(result.status, 400);
  assert.equal((await result.json()).error, 'Заполните обязательные поля.');
});
