import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { escaparXml, svgCompartilhamento, tamanhoQueCabe } from '../src/lib/og.ts';
import { conteudoSchema } from '../src/lib/schema.ts';

const ler = (): Record<string, any> => JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));

test('escapes XML special characters', () => {
  assert.equal(escaparXml(`"A" & <b>'s`), '&quot;A&quot; &amp; &lt;b&gt;&apos;s');
});

test('shrinks the font so long names fit the text column', () => {
  assert.equal(tamanhoQueCabe('Taz', 600, 104), 104);
  assert.ok(tamanhoQueCabe('TazTheDoctorTazTheDoctor', 600, 104) * 24 * 0.62 <= 600);
});

test('share image is a 1200x630 SVG with the artist name, nickname and theme', () => {
  const dados = ler();
  const svg = svgCompartilhamento(conteudoSchema.parse(dados));
  assert.match(svg, /^<svg [^>]*width="1200" height="630"/);
  assert.ok(svg.includes(escaparXml(dados.site.nome)));
  assert.ok(svg.includes('ninja dos beats'));
  assert.ok(svg.includes(dados.tema.cor_fundo));
});

test('the share image survives hostile text', () => {
  const dados = ler();
  dados.site.nome = 'A & B <Dev>';
  const svg = svgCompartilhamento(conteudoSchema.parse(dados));
  assert.ok(svg.includes('A &amp; B &lt;Dev&gt;'));
  assert.equal(svg.includes('<Dev>'), false);
});
