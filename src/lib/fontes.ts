// Web fonts: tema.fontes lists the Google Fonts families to self-host (downloaded at build
// time by the Astro Fonts API); tema.fonte_titulo / tema.fonte_texto stay plain CSS stacks.

export interface FonteSite {
  familia: string;
  pesos: number[];
}

/** Splits a CSS font-family stack into family names, without quotes. */
export function separarPilha(pilha: string): string[] {
  return pilha
    .split(',')
    .map((nome) => nome.trim().replace(/^(["'])(.*)\1$/, '$2').trim())
    .filter(Boolean);
}

/** CSS variable that holds a self-hosted family, e.g. "Source Serif 4" -> --fonte-source-serif-4. */
export function variavelFonte(familia: string): string {
  const slug = familia
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `--fonte-${slug}`;
}

/** Fallback families of `familia`: what follows it in the first stack that uses it. */
export function reservasDaFonte(familia: string, pilhas: string[]): string[] {
  for (const pilha of pilhas) {
    const nomes = separarPilha(pilha);
    const i = nomes.findIndex((nome) => nome.toLowerCase() === familia.toLowerCase());
    if (i !== -1) return nomes.slice(i + 1);
  }
  return [];
}

/**
 * Rewrites a stack so each self-hosted family points at its CSS variable, which already carries
 * the hashed @font-face name, the metric-matched fallback and the fallbacks from `pilhas`.
 */
export function pilhaComFontes(pilha: string, fontes: Pick<FonteSite, 'familia'>[], pilhas: string[] = [pilha]): string {
  const saida: string[] = [];
  const cobertas = new Set<string>();
  for (const nome of separarPilha(pilha)) {
    const fonte = fontes.find((f) => f.familia.toLowerCase() === nome.toLowerCase());
    if (fonte) {
      saida.push(`var(${variavelFonte(fonte.familia)})`);
      reservasDaFonte(fonte.familia, pilhas).forEach((reserva) => cobertas.add(reserva.toLowerCase()));
    } else if (!cobertas.has(nome.toLowerCase())) {
      saida.push(/^[a-z-]+$/i.test(nome) ? nome : `"${nome}"`);
    }
  }
  return saida.join(', ');
}
