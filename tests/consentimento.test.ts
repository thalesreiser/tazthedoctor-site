import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CHAVE_CONSENTIMENTO,
  chamadasConversao,
  ehLinkEmail,
  gravarEscolha,
  lerEscolha,
  mostrarAviso,
  podeRastrear,
  temRastreamento,
} from '../src/lib/consentimento.ts';
import { conteudoSchema } from '../src/lib/schema.ts';
import { termosEncontrados } from '../src/lib/termos.ts';

function memoria(inicial: Record<string, string> = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    getItem: (chave: string) => dados.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void dados.set(chave, valor),
  };
}

const bloqueado = () => {
  throw new Error('SecurityError');
};

test('detects whether any tracking id is set', () => {
  assert.equal(temRastreamento({}), false);
  assert.equal(temRastreamento({ google_analytics: 'G-TESTE123' }), true);
  assert.equal(temRastreamento({ meta_pixel: '123456789012345' }), true);
});

test('reads and writes the choice', () => {
  const armazenamento = memoria();
  assert.equal(lerEscolha(() => armazenamento), null);
  assert.equal(gravarEscolha(() => armazenamento, 'aceito'), true);
  assert.equal(armazenamento.getItem(CHAVE_CONSENTIMENTO), 'aceito');
  assert.equal(lerEscolha(() => armazenamento), 'aceito');
  gravarEscolha(() => armazenamento, 'recusado');
  assert.equal(lerEscolha(() => armazenamento), 'recusado');
});

test('ignores unknown stored values', () => {
  assert.equal(lerEscolha(() => memoria({ [CHAVE_CONSENTIMENTO]: 'talvez' })), null);
});

test('survives blocked storage', () => {
  assert.equal(lerEscolha(bloqueado), null);
  assert.equal(gravarEscolha(bloqueado, 'aceito'), false);
  const falhaNoSet = { getItem: () => null, setItem: bloqueado };
  assert.equal(gravarEscolha(() => falhaNoSet, 'aceito'), false);
});

test('tracks only after an explicit accept', () => {
  assert.equal(podeRastrear(null), false);
  assert.equal(podeRastrear('recusado'), false);
  assert.equal(podeRastrear('aceito'), true);
});

test('shows the banner only while there is no choice', () => {
  assert.equal(mostrarAviso(null), true);
  assert.equal(mostrarAviso('aceito'), false);
  assert.equal(mostrarAviso('recusado'), false);
});

test('recognizes e-mail links', () => {
  assert.equal(ehLinkEmail('mailto:tazthedoctor@gmail.com?subject=Ol%C3%A1'), true);
  assert.equal(ehLinkEmail('mailto:'), false);
  assert.equal(ehLinkEmail('https://example.com/mailto:a@b.com'), false);
  assert.equal(ehLinkEmail('/politica-de-privacidade'), false);
});

test('maps conversions to GA4 and Meta Pixel calls', () => {
  const ambas = { google_analytics: 'G-TESTE123', meta_pixel: '123456789012345' };
  assert.deepEqual(chamadasConversao('email', ambas), [
    { ferramenta: 'google_analytics', argumentos: ['event', 'generate_lead', { method: 'email' }] },
    { ferramenta: 'meta_pixel', argumentos: ['track', 'Contact'] },
  ]);
  assert.deepEqual(chamadasConversao('formulario', ambas), [
    { ferramenta: 'google_analytics', argumentos: ['event', 'generate_lead', { method: 'form' }] },
    { ferramenta: 'meta_pixel', argumentos: ['track', 'Lead'] },
  ]);
});

test('sends events only to the configured tools', () => {
  assert.deepEqual(chamadasConversao('email', {}), []);
  assert.deepEqual(
    chamadasConversao('formulario', { meta_pixel: '123456789012345' }).map((c) => c.ferramenta),
    ['meta_pixel'],
  );
});

const ler = () => JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')) as Record<string, unknown>;

test('banner texts default to pt-BR and can be overridden', () => {
  const padrao = conteudoSchema.parse({ ...ler(), rastreamento: { google_analytics: 'G-TESTE123' } });
  assert.equal(padrao.rastreamento.aviso_cookies.aceitar, 'Aceitar');
  assert.equal(padrao.rastreamento.aviso_cookies.recusar, 'Recusar');
  assert.match(padrao.rastreamento.aviso_cookies.texto, /só são ativados se você aceitar/);
  const proprio = conteudoSchema.parse({ ...ler(), rastreamento: { aviso_cookies: { aceitar: 'Concordo' } } });
  assert.equal(proprio.rastreamento.aviso_cookies.aceitar, 'Concordo');
  assert.equal(proprio.rastreamento.aviso_cookies.recusar, 'Recusar');
});

test('the site ships without tracking, so no banner and no third-party script', () => {
  assert.equal(temRastreamento(conteudoSchema.parse(ler()).rastreamento), false);
});

// Default texts live in src/, outside the JSON the vetoed-terms test scans.
test('default banner texts use none of the vetoed terms', () => {
  const conteudo = conteudoSchema.parse(ler());
  assert.deepEqual(termosEncontrados(conteudo.rastreamento.aviso_cookies, conteudo.revisao.termos_vetados), []);
});
