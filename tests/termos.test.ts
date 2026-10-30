import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizar, termosEncontrados, textos } from '../src/lib/termos.ts';

test('normalizes case and accents', () => {
  assert.equal(normalizar('Grátis, GARANTIDO e Ação'), 'gratis, garantido e acao');
});

test('lists every string with its path', () => {
  assert.deepEqual(textos({ a: 'x', b: [{ c: 'y' }, 1, true], d: null }), [
    { caminho: 'a', texto: 'x' },
    { caminho: 'b[0].c', texto: 'y' },
  ]);
});

test('finds vetoed terms ignoring case and accents', () => {
  const nicho = { secoes: [{ titulo: 'Consulta GRATIS hoje' }, { texto: 'Somos o Melhor escritório' }] };
  assert.deepEqual(termosEncontrados(nicho, ['grátis', 'o melhor']), ['secoes[0].titulo: grátis', 'secoes[1].texto: o melhor']);
});

test('matches whole words only', () => {
  const nicho = { texto: 'Atendimento no laptop; especialidades médicas; topografia' };
  assert.deepEqual(termosEncontrados(nicho, ['top', 'especialista']), []);
});

test('handles terms with symbols', () => {
  assert.deepEqual(termosEncontrados({ t: 'Honorários a partir de R$ 200 e 100% de êxito' }, ['a partir de R$', '100%']), [
    't: a partir de R$',
    't: 100%',
  ]);
});

test('ignores the revisao block that holds the list itself', () => {
  assert.deepEqual(termosEncontrados({ revisao: { termos_vetados: ['garantido'] } }, ['garantido']), []);
});
