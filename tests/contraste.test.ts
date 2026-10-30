import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { misturar, razaoContraste } from '../src/lib/contraste.ts';
import { conteudoSchema } from '../src/lib/schema.ts';
import { OPACIDADE_BRILHO } from '../src/lib/tema.ts';

const AA = 4.5;
// Fixed color of form field errors (--color-erro in global.css).
const COR_ERRO = '#FF9C8A';
// Generated player cover: the primary color at 45% over the stage color (.capa-player).
const OPACIDADE_CAPA = 0.45;
// Film grain over the page (.grao::after): worst case, white noise at 5%.
const OPACIDADE_GRAO = 0.05;

test('contrast ratio matches the WCAG reference values', () => {
  assert.equal(razaoContraste('#000000', '#FFFFFF'), 21);
  assert.equal(razaoContraste('#777777', '#777777'), 1);
  assert.equal(Math.round(razaoContraste('#767676', '#FFFFFF') * 100) / 100, 4.54);
});

test('blends a color over a background', () => {
  assert.equal(misturar('#FFFFFF', '#000000', 0.5), '#808080');
  assert.equal(misturar('#FFFFFF', '#000000', 1), '#ffffff');
});

test('every color pair used by the components passes WCAG AA', () => {
  const { tema: t } = conteudoSchema.parse(JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')));
  const escuros: [string, string][] = [
    ['palco', t.cor_fundo],
    ['superfície', t.cor_superficie],
    // Strongest spot of the stage glow (hero, contact) over either dark color.
    ['brilho sobre palco', misturar(t.cor_primaria, t.cor_fundo, OPACIDADE_BRILHO)],
    ['brilho sobre superfície', misturar(t.cor_primaria, t.cor_superficie, OPACIDADE_BRILHO)],
    ['grão sobre palco', misturar('#FFFFFF', t.cor_fundo, OPACIDADE_GRAO)],
    ['grão sobre superfície', misturar('#FFFFFF', t.cor_superficie, OPACIDADE_GRAO)],
  ];
  const pares: [string, string, string][] = [
    // Text, muted text (paragraphs, placeholders, labels), primary (links, outlined buttons),
    // warm and cool accents (nickname, kickers) and form errors on every dark background.
    ...escuros.flatMap(([nome, fundo]): [string, string, string][] => [
      [`texto sobre ${nome}`, t.cor_texto, fundo],
      [`texto suave sobre ${nome}`, t.cor_texto_suave, fundo],
      [`primária sobre ${nome}`, t.cor_primaria, fundo],
      [`destaque sobre ${nome}`, t.cor_destaque, fundo],
      [`destaque frio sobre ${nome}`, t.cor_destaque_frio, fundo],
      // "Taz" in dripping paint on the hero (and its spray orange elsewhere on dark).
      [`spray sobre ${nome}`, t.cor_spray, fundo],
      [`erro de formulário sobre ${nome}`, COR_ERRO, fundo],
    ]),
    // Primary buttons, construction notice, play buttons and text selection.
    ['botão primário', t.cor_primaria_contraste, t.cor_primaria],
    // Hero ticker (amber strip) is the primary button pair above; contact ticker and the
    // "ninja dos beats" sticker ring draw the stage color on spray orange.
    ['faixa e adesivo sobre spray', t.cor_fundo, t.cor_spray],
    // Platform stickers on the cream band: dark icon on spray.
    ['creme: adesivo spray', t.cor_creme_texto, t.cor_spray],
    // "99'" sticker on the about photo.
    ['selo sobre destaque', t.cor_primaria_contraste, t.cor_destaque],
    // Player cover title over its strongest warm spot.
    ['capa do player', t.cor_texto, misturar(t.cor_primaria, t.cor_fundo, OPACIDADE_CAPA)],
    // Cookie banner: stage color on the text color.
    ['aviso de cookies', t.cor_fundo, t.cor_texto],
    // Cream band (fundo: "creme"): text, muted text, links/kickers and its buttons.
    ['creme: texto', t.cor_creme_texto, t.cor_creme],
    ['creme: texto suave', t.cor_creme_texto_suave, t.cor_creme],
    ['creme: primária', t.cor_creme_primaria, t.cor_creme],
    ['creme: botão', t.cor_creme, t.cor_creme_primaria],
    ['creme: grão', t.cor_creme_texto_suave, misturar('#000000', t.cor_creme, OPACIDADE_GRAO)],
  ];
  const reprovados = pares
    .map(([nome, a, b]) => ({ nome, razao: razaoContraste(a, b) }))
    .filter(({ razao }) => razao < AA)
    .map(({ nome, razao }) => `${nome}: ${razao.toFixed(2)}`);
  assert.deepEqual(reprovados, [], `pares abaixo de ${AA}:1`);
});

// Focus rings and the outlined card borders on hover need 3:1 against what is around them.
test('focus ring colors stand out (3:1, non-text contrast)', () => {
  const { tema: t } = conteudoSchema.parse(JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')));
  for (const fundo of [t.cor_fundo, t.cor_superficie]) assert.ok(razaoContraste(t.cor_destaque_frio, fundo) >= 3);
  assert.ok(razaoContraste(t.cor_creme_primaria, t.cor_creme) >= 3);
});
