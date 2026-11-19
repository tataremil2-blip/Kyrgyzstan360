import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const url = new URL('../lib/route-catalog.ts', import.meta.url);
const code = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const exports = {};
vm.runInNewContext(code, { exports, require: createRequire(url) });
const { routeCatalog, validateCatalog, generationReadiness, getQuotableTariffs } = exports;

test('imported catalogue has consistent IDs, bilingual days and intact source snapshots', () => {
  assert.equal(validateCatalog().length, 0);
  assert.deepEqual(Array.from(routeCatalog.routes, (route) => route.durationDays), [6, 8, 7]);
  for (const source of routeCatalog.sources) {
    const file = new URL('../' + source.file, import.meta.url);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), source.sha256, `Source changed: ${source.id}; review its imported records.`);
  }
});

test('all imported records remain drafts; advertised season never implies readiness', () => {
  for (const route of routeCatalog.routes) {
    assert.equal(generationReadiness(route.id, '2026-11-19').ready, false);
    assert.equal(getQuotableTariffs(route.id, '2026-11-19').length, 0);
  }
  assert.equal(routeCatalog.tariffs.find((tariff) => tariff.routeId === 'private-6').unit, 'unknown');
  assert.ok(routeCatalog.places.every((place) => place.coordinates === null));
});

// Deliberately synthetic values: this fixture must never become travel data.
function verifiedFixture() {
  const review = { status: 'verified', verifiedAt: '2026-11-01', validUntil: '2026-12-01', verifiedBy: 'synthetic test' };
  const name = { en: 'Test', ru: 'Тест' };
  return {
    schemaVersion: 1, sources: [{ id: 'test', file: 'test', locator: 'test', capturedAt: '2026-11-01', sha256: '' }],
    places: [{ id: 'p', name, coordinates: { latitude: 0, longitude: 0 }, visitMinutes: 60, openMonths: [6, 7], permit: { requirement: 'not-required', leadDays: null }, sourceIds: ['test'], review }],
    segments: [],
    routes: [{ id: 'r', name, durationDays: 1, sourceIds: ['test'], advertisedMonths: [6, 7], confirmedMonths: [6, 7], days: [{ day: 1, title: name, description: name, stopIds: ['p'], overnightPlaceId: null, overnightLabel: null, activityMinutes: 60, bufferMinutes: 30, review }], included: [], excluded: [], requirements: [], notes: [], review }],
    tariffs: [{ id: 't', routeId: 'r', amount: 100, currency: 'USD', unit: 'person', kind: 'published', travelMode: 'private', seats: null, sourceIds: ['test'], review }],
  };
}

test('verified fixture becomes ineligible after expiry, with unknown permits or missing timing', () => {
  const data = verifiedFixture();
  assert.equal(generationReadiness('r', '2026-11-19', data).ready, true);
  assert.equal(getQuotableTariffs('r', '2026-11-19', data).length, 1);
  assert.equal(generationReadiness('r', '2026-12-02', data).ready, false);
  assert.equal(generationReadiness('r', 'not-a-date', data).ready, false);
  data.places[0].permit.requirement = 'unknown';
  assert.equal(generationReadiness('r', '2026-11-19', data).ready, false);
  data.places[0].permit.requirement = 'not-required';
  data.routes[0].days[0].bufferMinutes = null;
  assert.equal(generationReadiness('r', '2026-11-19', data).ready, false);
});

test('a tariff without a unit or with expired verification cannot be quoted', () => {
  const data = verifiedFixture();
  data.tariffs[0].unit = 'unknown';
  assert.equal(getQuotableTariffs('r', '2026-11-19', data).length, 0);
  data.tariffs[0].unit = 'person';
  data.tariffs[0].review = { ...data.tariffs[0].review, validUntil: '2026-11-18' };
  assert.equal(getQuotableTariffs('r', '2026-11-19', data).length, 0);
});

test('duplicate IDs and unrecorded directional transfers are structural errors', () => {
  const data = verifiedFixture();
  data.places.push({ ...data.places[0], id: 'q' });
  data.routes[0].days[0].stopIds.push('q');
  assert.ok(validateCatalog(data).some((error) => error.includes('missing directed segment')));
  data.places.push({ ...data.places[0] });
  assert.ok(validateCatalog(data).some((error) => error.includes('duplicate')));
});
