// Vetoed-terms check for the site copy (hype words, promises of results).
// Matching ignores case and accents and only hits whole words or phrases.

/** Lowercase text without diacritics. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Every string inside a JSON value, with its path (e.g. "secoes[0].titulo"). */
export function textos(valor: unknown, caminho = ''): { caminho: string; texto: string }[] {
  if (typeof valor === 'string') return [{ caminho, texto: valor }];
  if (Array.isArray(valor)) return valor.flatMap((item, i) => textos(item, `${caminho}[${i}]`));
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([chave, item]) => textos(item, caminho ? `${caminho}.${chave}` : chave));
  }
  return [];
}

function padrao(termo: string): RegExp {
  const escapado = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapado}(?![\\p{L}\\p{N}])`, 'u');
}

/** Occurrences of vetoed terms in the content texts, as "path: term"; the `revisao` block itself is skipped. */
export function termosEncontrados(nicho: unknown, termos: string[]): string[] {
  const padroes = termos.map((termo) => ({ termo, re: padrao(termo) }));
  return textos(nicho)
    .filter(({ caminho }) => !caminho.startsWith('revisao'))
    .flatMap(({ caminho, texto }) => {
      const normalizado = normalizar(texto);
      return padroes.filter(({ re }) => re.test(normalizado)).map(({ termo }) => `${caminho}: ${termo}`);
    });
}
