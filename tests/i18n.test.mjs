import test from 'node:test';
import assert from 'node:assert/strict';
import { localizedHref, stripLocale, isLocale } from '../lib/i18n.ts';

test('navigation retains the selected locale and URL suffix', () => {
  assert.equal(localizedHref('/tours/group?days=8#booking', 'ru'), '/ru/tours/group?days=8#booking');
  assert.equal(localizedHref('/en/winter-freeride', 'ru'), '/ru/winter-freeride');
  assert.equal(localizedHref('/ru', 'en'), '/en');
  assert.equal(localizedHref('/#explore', 'ru'), '/ru/#explore');
});

test('assets, API, external links and in-page anchors remain unchanged', () => {
  for (const href of ['/api/inquiries', '/hero-kyrgyzstan.jpg', '/guide.pdf?download=1', 'https://example.com', '//example.com', 'mailto:test@example.com', '#booking']) {
    assert.equal(localizedHref(href, 'ru'), href);
  }
});

test('page identity remains stable for home and winter inquiry handling', () => {
  assert.equal(stripLocale('/ru'), '/');
  assert.equal(stripLocale('/en/'), '/');
  assert.equal(stripLocale('/ru/winter-freeride'), '/winter-freeride');
  assert.equal(stripLocale('/rent'), '/rent');
  assert.equal(isLocale('fr'), false);
});
