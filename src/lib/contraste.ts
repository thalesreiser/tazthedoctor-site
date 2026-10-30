// WCAG 2.x contrast helpers, used by the tests to keep the theme at level AA.

function canais(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminancia(hex: string): number {
  const [r, g, b] = canais(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two #RRGGBB colors (1 to 21). */
export function razaoContraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (escuro + 0.05);
}

/** Color seen when `frente` is drawn with `opacidade` (0 to 1) over `fundo`. */
export function misturar(frente: string, fundo: string, opacidade: number): string {
  const f = canais(frente);
  const b = canais(fundo);
  const mistura = f.map((c, i) => Math.round(c * opacidade + b[i]! * (1 - opacidade)));
  return `#${mistura.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
