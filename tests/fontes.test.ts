import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pilhaComFontes, reservasDaFonte, separarPilha, variavelFonte } from '../src/lib/fontes.ts';

test('splits a font stack and strips quotes', () => {
  assert.deepEqual(separarPilha(`"Source Serif 4", Georgia, 'Times New Roman', serif`), ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif']);
});

test('CSS variable name from the family', () => {
  assert.equal(variavelFonte('Source Serif 4'), '--fonte-source-serif-4');
  assert.equal(variavelFonte('Nunito Sans'), '--fonte-nunito-sans');
});

test('fallbacks are what follows the family in its stack', () => {
  const pilhas = ['"Source Serif 4", Georgia, serif', 'Inter, system-ui, sans-serif'];
  assert.deepEqual(reservasDaFonte('Inter', pilhas), ['system-ui', 'sans-serif']);
  assert.deepEqual(reservasDaFonte('source serif 4', pilhas), ['Georgia', 'serif']);
  assert.deepEqual(reservasDaFonte('Roboto', pilhas), []);
});

test('self-hosted families become their variable, without repeating its fallbacks', () => {
  const fontes = [{ familia: 'Source Serif 4' }, { familia: 'Inter' }];
  const pilhas = ['"Source Serif 4", Georgia, serif', 'Inter, system-ui, sans-serif'];
  assert.equal(pilhaComFontes(pilhas[0]!, fontes, pilhas), 'var(--fonte-source-serif-4)');
  assert.equal(pilhaComFontes('Inter, Arial, system-ui, sans-serif', fontes, pilhas), 'var(--fonte-inter), Arial');
});

test('system stacks are left as they are', () => {
  assert.equal(pilhaComFontes('system-ui, "Segoe UI", sans-serif', []), 'system-ui, "Segoe UI", sans-serif');
});
