// Section backgrounds and motion settings, emitted by Base.astro as CSS variables and attributes.

// Dark stage base, a slightly lifted dark surface, or a cream band (the guitar's binding).
export const FUNDOS = ['palco', 'superficie', 'creme'] as const;
export type Fundo = (typeof FUNDOS)[number];

// "sutil" turns on scroll reveal, hover micro-interactions and the hero entrance;
// "nenhuma" turns all of it off. prefers-reduced-motion always wins.
export const ANIMACOES = ['sutil', 'nenhuma'] as const;
export type Animacoes = (typeof ANIMACOES)[number];

// Opacity of the warm glow drawn behind the hero (global.css, .brilho-palco).
export const OPACIDADE_BRILHO = 0.12;

// Opacity of the concrete wall texture (global.css, .parede): its lightest blotches are cream.
export const OPACIDADE_PAREDE = 0.06;

/**
 * Background of each section, in order. An explicit `fundo` wins; the others alternate the two
 * dark colors (starting with palco), skipping over cream bands so dark sections never repeat.
 */
export function fundosDasSecoes(secoes: { fundo?: Fundo | undefined }[]): Fundo[] {
  let ultimoEscuro: Fundo = 'superficie';
  return secoes.map(({ fundo }) => {
    const escolhido = fundo ?? (ultimoEscuro === 'superficie' ? 'palco' : 'superficie');
    if (escolhido !== 'creme') ultimoEscuro = escolhido;
    return escolhido;
  });
}
