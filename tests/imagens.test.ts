import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { caminhoImagem, largurasImagem, resolverImagem } from '../src/lib/imagens.ts';

test('maps a JSON src to src/assets/site', () => {
  assert.equal(caminhoImagem('thales.jpg'), '/src/assets/site/thales.jpg');
  assert.equal(caminhoImagem('projetos/dbt.webp'), '/src/assets/site/projetos/dbt.webp');
});

test('rejects absolute, public, parent and unsupported paths', () => {
  for (const src of ['/img/thales.webp', '../thales.jpg', 'a/../../b.jpg', 'thales.gif', 'https://example.com/a.jpg', 'thales', 'thalesXjpg']) {
    assert.throws(() => caminhoImagem(src), /caminho relativo/, src);
  }
});

test('resolves an existing file from the glob result', () => {
  assert.equal(resolverImagem({ '/src/assets/site/thales.jpg': 'foto' }, 'thales.jpg'), 'foto');
});

test('a missing file fails with its expected path and the files that exist', () => {
  assert.throws(() => resolverImagem({ '/src/assets/site/outra.jpg': 'x' }, 'thales.jpg'), (erro: Error) => {
    assert.match(erro.message, /src\/assets\/site\/thales\.jpg/);
    assert.match(erro.message, /Arquivos nessa pasta: outra\.jpg\./);
    return true;
  });
});

test('srcset widths never upscale the original', () => {
  assert.deepEqual(largurasImagem(2400, [480, 960, 1280]), [480, 960, 1280]);
  assert.deepEqual(largurasImagem(1000, [480, 960, 1280]), [480, 960, 1000]);
  assert.deepEqual(largurasImagem(300, [480, 960]), [300]);
});

// Every image the content references must exist, so a missing photo is caught before the build.
test('images referenced by content/site.json exist in src/assets/site', () => {
  const fontes: string[] = [];
  JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'), (_chave, valor) => {
    if (valor && typeof valor === 'object' && typeof valor.src === 'string' && typeof valor.alt === 'string') fontes.push(valor.src);
    return valor;
  });
  for (const src of fontes) {
    assert.ok(existsSync(new URL(`..${caminhoImagem(src)}`, import.meta.url)), `${src} não existe`);
  }
});
