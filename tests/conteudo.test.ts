import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { conteudoSchema } from '../src/lib/schema.ts';
import { termosEncontrados } from '../src/lib/termos.ts';

type Dados = Record<string, any> & { secoes: Record<string, any>[] };
const original = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')) as Dados;
const copia = (): Dados => structuredClone(original);
const secao = (dados: Dados, tipo: string) => dados.secoes.find((s) => s.tipo === tipo)!;
const valido = (dados: unknown) => conteudoSchema.safeParse(dados).success;
const caminhos = (dados: unknown) => (conteudoSchema.safeParse(dados).error?.issues ?? []).map((i) => i.path.join('.'));

test('content/site.json matches the schema', () => {
  const resultado = conteudoSchema.safeParse(original);
  assert.ok(resultado.success, resultado.error?.message);
});

test('content/site.json uses none of its vetoed terms', () => {
  assert.deepEqual(termosEncontrados(original, original.revisao.termos_vetados), []);
});

test('the nickname is part of the identity, not a vetoed term', () => {
  assert.equal(secao(original, 'hero').apelido, 'ninja dos beats');
});

test('there is no phone or WhatsApp anywhere: e-mail is the only public contact', () => {
  const texto = JSON.stringify(original).toLowerCase();
  assert.equal(texto.includes('whatsapp'), false);
  assert.equal(/wa\.me|\+55|5551\d{6,}/.test(texto), false);
  assert.match(original.contato.email, /@/);
});

test('every platform and release link uses https', () => {
  const dados = copia();
  secao(dados, 'plataformas').itens[0].href = 'http://soundcloud.com/tazthedoctor';
  assert.equal(valido(dados), false);
  const outra = copia();
  secao(outra, 'musica').itens[0].url = 'http://soundcloud.com/tazthedoctor/x';
  assert.equal(valido(outra), false);
});

test('releases need a valid embed id for their platform', () => {
  const dados = copia();
  const sc = secao(dados, 'musica').itens.find((i: { plataforma: string }) => i.plataforma === 'soundcloud');
  sc.faixa_id = 'nao-numerico';
  assert.equal(valido(dados), false);
  const outra = copia();
  const yt = secao(outra, 'musica').itens.find((i: { plataforma: string }) => i.plataforma === 'youtube');
  yt.video_id = 'curto';
  assert.equal(valido(outra), false);
});

test('release dates are ISO dates', () => {
  const dados = copia();
  secao(dados, 'musica').itens[0].data = '28/06/2025';
  assert.equal(valido(dados), false);
});

test('every photo has alt text', () => {
  const dados = copia();
  secao(dados, 'hero').foto.alt = '';
  assert.equal(valido(dados), false);
});

test('em_construcao is required, so the notice is never dropped by accident', () => {
  const dados = copia();
  delete dados.em_construcao;
  assert.equal(valido(dados), false);
});

test('leaving em_construcao requires a form key and no pending notes', () => {
  const dados = copia();
  dados.em_construcao = false;
  const erros = caminhos(dados);
  assert.ok(erros.some((c) => /^secoes\.\d+\.chave$/.test(c)), erros.join(', '));
  assert.ok(erros.some((c) => /^secoes\.\d+\.a_completar$/.test(c)), erros.join(', '));

  secao(dados, 'contato').chave = 'chave-publica';
  for (const s of dados.secoes) if ('a_completar' in s) s.a_completar = [];
  assert.equal(valido(dados), true);
  // Turning the form off is the other way out.
  secao(dados, 'contato').chave = '';
  secao(dados, 'contato').ativo = false;
  assert.equal(valido(dados), true);
});

test('a placeholder e-mail blocks publishing', () => {
  const dados = copia();
  dados.em_construcao = false;
  dados.contato.email = 'contato@example.com';
  assert.ok(caminhos(dados).includes('contato.email'));
});

test('rejects an unknown icon', () => {
  const dados = copia();
  secao(dados, 'plataformas').itens[0].icone = 'nao-existe';
  assert.equal(valido(dados), false);
});

test('rejects duplicated section ids', () => {
  const dados = copia();
  dados.secoes.push({ tipo: 'sobre', id: 'estudio', titulo: 'De novo', paragrafos: ['P'] });
  const resultado = conteudoSchema.safeParse(dados);
  assert.equal(resultado.success, false);
  assert.match(resultado.error!.message, /ids de seção repetidos: estudio/);
});

test('requires options on select fields', () => {
  const dados = copia();
  delete secao(dados, 'contato').campos.find((c: { tipo: string }) => c.tipo === 'select').opcoes;
  assert.equal(valido(dados), false);
});

test('the contact section cannot use the cream band', () => {
  const dados = copia();
  secao(dados, 'contato').fundo = 'creme';
  assert.equal(valido(dados), false);
});

test('rejects a self-hosted font that no font stack uses', () => {
  const dados = copia();
  dados.tema.fontes.push({ familia: 'Inter', pesos: [400] });
  const resultado = conteudoSchema.safeParse(dados);
  assert.equal(resultado.success, false);
  assert.match(resultado.error!.issues[0]!.message, /"Inter" não aparece/);
});

test('image src must be a path inside src/assets/site', () => {
  const dados = copia();
  secao(dados, 'sobre').foto = { src: '/img/taz.jpg', alt: 'Retrato' };
  assert.equal(valido(dados), false);
  secao(dados, 'sobre').foto = { src: 'taz.jpg', alt: 'Retrato' };
  assert.equal(valido(dados), true);
});

test('the platforms section takes at most two photo tiles', () => {
  const dados = copia();
  const plataformas = secao(dados, 'plataformas');
  plataformas.fotos = [...plataformas.fotos, plataformas.fotos[0]];
  assert.equal(valido(dados), false);
});

test('motion can be turned off', () => {
  const dados = copia();
  dados.tema.animacoes = 'nenhuma';
  assert.equal(conteudoSchema.parse(dados).tema.animacoes, 'nenhuma');
  dados.tema.animacoes = 'muita';
  assert.equal(valido(dados), false);
});

test('the street fonts are self-hosted through the tag and paint stacks', () => {
  const { tema } = conteudoSchema.parse(original);
  const familias = tema.fontes.map((f) => f.familia);
  assert.ok(familias.includes('Sedgwick Ave Display') && tema.fonte_tag.includes('Sedgwick Ave Display'));
  assert.ok(familias.includes('Rubik Wet Paint') && tema.fonte_tinta.includes('Rubik Wet Paint'));
  // Dropping the paint stack leaves Rubik Wet Paint unused, which the schema refuses.
  const dados = copia();
  dados.tema.fonte_tinta = 'Anton, Impact, sans-serif';
  assert.equal(valido(dados), false);
});

test('tickers repeat page text only: hero words and the contact call stay short', () => {
  const hero = secao(original, 'hero');
  assert.ok(hero.faixa.length > 0 && hero.faixa.every((palavra: string) => palavra.length <= 20));
  const contato = secao(original, 'contato');
  assert.ok(typeof contato.faixa === 'string' && contato.faixa.length <= 30);
  // The e-mail in the contact ticker comes from contato.email, never from the call itself.
  assert.equal(contato.faixa.includes('@'), false);
});
