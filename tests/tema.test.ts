import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fundosDasSecoes } from '../src/lib/tema.ts';

test('sections alternate the dark backgrounds, starting with palco', () => {
  assert.deepEqual(fundosDasSecoes([{}, {}, {}, {}]), ['palco', 'superficie', 'palco', 'superficie']);
});

test('an explicit background wins and auto sections continue from it', () => {
  assert.deepEqual(fundosDasSecoes([{}, { fundo: 'palco' }, {}]), ['palco', 'palco', 'superficie']);
});

test('a cream band does not break the dark alternation', () => {
  assert.deepEqual(fundosDasSecoes([{}, {}, { fundo: 'creme' }, {}]), ['palco', 'superficie', 'creme', 'palco']);
});
