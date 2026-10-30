import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { conteudoSchema, type Conteudo } from '../src/lib/schema.ts';
import { gerarJsonLd, localeOg, robotsTxt, serializarJsonLd, urlAbsoluta } from '../src/lib/seo.ts';

const ler = (): Record<string, any> => JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const parse = (dados: unknown): Conteudo => conteudoSchema.parse(dados);
const grafo = (c: Conteudo) => gerarJsonLd(c)['@graph'] as Record<string, any>[];
const tipo = (c: Conteudo, t: string) => grafo(c).find((item) => item['@type'] === t);

test('builds absolute URLs only when site.url is set', () => {
  assert.equal(urlAbsoluta('https://a.pages.dev', '/og.png'), 'https://a.pages.dev/og.png');
  assert.equal(urlAbsoluta(undefined, '/'), undefined);
});

test('converts the language tag to an Open Graph locale', () => {
  assert.equal(localeOg('pt-BR'), 'pt_BR');
  assert.equal(localeOg('en'), 'en');
});

test('describes the artist as a MusicGroup with the person as member', () => {
  const dados = ler();
  const conteudo = parse(dados);
  const grupo = tipo(conteudo, 'MusicGroup')!;
  const pessoa = tipo(conteudo, 'Person')!;
  assert.equal(gerarJsonLd(conteudo)['@context'], 'https://schema.org');
  assert.equal(grupo.name, dados.artista.nome_artistico);
  assert.equal(grupo.alternateName, dados.artista.apelido);
  assert.deepEqual(grupo.sameAs, dados.artista.perfis);
  assert.deepEqual(grupo.member, { '@id': `${dados.site.url}/#pessoa` });
  assert.equal(grupo.image, `${dados.site.url}/og.png`);
  assert.equal(pessoa.name, dados.artista.nome);
  assert.equal(pessoa.alternateName, dados.artista.nome_artistico);
  assert.equal(pessoa.birthDate, '1999');
});

test('lists only the audio releases as recordings', () => {
  const dados = ler();
  const grupo = tipo(parse(dados), 'MusicGroup')!;
  const audios = dados.secoes
    .find((s: { tipo: string }) => s.tipo === 'musica')
    .itens.filter((i: { plataforma: string }) => i.plataforma === 'soundcloud');
  assert.equal(grupo.track.length, audios.length);
  assert.deepEqual(grupo.track[0], { '@type': 'MusicRecording', name: audios[0].titulo, url: audios[0].url, datePublished: audios[0].data });
});

test('publishes the real e-mail and never a placeholder one', () => {
  const dados = ler();
  assert.equal(tipo(parse(dados), 'MusicGroup')!.email, dados.contato.email);
  dados.contato.email = 'contato@example.com';
  assert.equal('email' in tipo(parse(dados), 'MusicGroup')!, false);
});

test('leaves out URLs when there is no site.url', () => {
  const dados = ler();
  delete dados.site.url;
  const ld = JSON.parse(serializarJsonLd(gerarJsonLd(parse(dados))));
  for (const item of ld['@graph']) {
    for (const chave of ['url', '@id', 'image']) assert.equal(chave in item, false, chave);
  }
});

test('escapes the JSON so it cannot close the script tag', () => {
  const texto = serializarJsonLd({ a: '</script><script>alert(1)</script>', b: 'x & y' });
  assert.equal(/[<>&]/.test(texto), false);
  assert.deepEqual(JSON.parse(texto), { a: '</script><script>alert(1)</script>', b: 'x & y' });
});

test('robots.txt allows crawling and points to the sitemap', () => {
  assert.equal(robotsTxt('https://a.pages.dev/'), 'User-agent: *\nAllow: /\n\nSitemap: https://a.pages.dev/sitemap-index.xml\n');
  assert.equal(robotsTxt(undefined), 'User-agent: *\nAllow: /\n');
});
