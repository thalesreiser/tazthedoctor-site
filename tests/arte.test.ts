import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  aleatorio,
  bordaRasgada,
  duasLinhas,
  explosao,
  GLIFOS,
  letrasSemGlifo,
  linhaDeLetras,
  MODELOS_ADESIVO,
  NOMES_RABISCOS,
  ondaOsciloscopio,
  pingos,
  respingos,
} from '../src/lib/arte.ts';

const site = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const numeros = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

test('seeded randomness repeats, so every build draws the same art', () => {
  const a = aleatorio(42);
  const b = aleatorio(42);
  const sequencia = Array.from({ length: 5 }, () => a());
  assert.deepEqual(sequencia, Array.from({ length: 5 }, () => b()));
  assert.ok(sequencia.every((n) => n >= 0 && n < 1));
  assert.notDeepEqual(sequencia, Array.from({ length: 5 }, aleatorio(43)));
});

test('the throw-up can draw every letter of the artist name', () => {
  assert.deepEqual(letrasSemGlifo(site.site.nome), []);
  assert.deepEqual(letrasSemGlifo('Taz 2'), ['2']);
  const { tracos, largura } = linhaDeLetras('TAZ');
  assert.equal(tracos.length, GLIFOS.T!.tracos.length + GLIFOS.A!.tracos.length + GLIFOS.Z!.tracos.length);
  assert.ok(largura > 0);
  assert.equal(linhaDeLetras('TAZ', { escala: 0.5 }).largura, largura / 2);
});

test('the torn edge is a closed shape that stays inside its box', () => {
  const d = bordaRasgada(7, { largura: 1200, altura: 40 });
  assert.match(d, /^M0 40 L/);
  assert.match(d, /L1200 40 Z$/);
  const valores = numeros(d);
  const ys = valores.filter((_, i) => i % 2 === 1);
  const xs = valores.filter((_, i) => i % 2 === 0);
  assert.ok(ys.every((y) => y >= 0 && y <= 40));
  assert.ok(xs.every((x) => x >= 0 && x <= 1200));
  assert.notEqual(bordaRasgada(8), d);
});

test('specks, drips and the scope line stay in range', () => {
  for (const s of respingos(3, 50, 600, 50)) {
    assert.ok(s.cx >= 0 && s.cx <= 600 && s.cy >= 0 && s.cy <= 50 && s.r > 0 && s.opacidade > 0);
  }
  for (const p of pingos(3, 4)) assert.ok(p.x >= 0 && p.x <= 100 && p.comprimento >= 18 && p.largura >= 3);
  const ys = numeros(ondaOsciloscopio(5, 1200, 40)).filter((_, i) => i % 2 === 1);
  assert.ok(ys.every((y) => y >= 0 && y <= 40));
});

test('stickers: models listed, two-line split and starburst points', () => {
  assert.ok(MODELOS_ADESIVO.includes('ninja') && MODELOS_ADESIVO.length >= 5);
  assert.deepEqual(duasLinhas('feito no estúdio'), ['feito no', 'estúdio']);
  assert.deepEqual(duasLinhas('REC'), ['REC', '']);
  assert.equal(numeros(explosao(70, 70, 60, 48, 12)).length, 12 * 2 * 2);
  assert.ok(NOMES_RABISCOS.includes('coroa') && NOMES_RABISCOS.includes('raio'));
});
