// Street art drawn in code: graffiti letters, doodles, torn paper edges, spray specks and the
// oscilloscope line. Everything is deterministic (seeded), so the build always renders the same
// SVG and nothing is downloaded.

/** Seeded pseudo-random numbers in [0, 1) (mulberry32): same seed, same sequence. */
export function aleatorio(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const arred = (n: number) => Math.round(n * 10) / 10;

/*
  Throw-up letters: the centre line of each capital in a 10-unit-tall box. The piece strokes the
  same lines several times (3D block, cut line, outline, fill, shine), so thick round strokes turn
  them into bubble letters. Each sub-path is its own stroke, so they can draw one by one.
*/
export const GLIFOS: Record<string, { largura: number; tracos: string[] }> = {
  T: { largura: 6.2, tracos: ['M0 0.6 L6.2 0', 'M3.1 0.3 L3.1 10'] },
  A: { largura: 6, tracos: ['M0 10 L3 0 L6 10', 'M1.6 6.6 L4.5 6.6'] },
  Z: { largura: 6, tracos: ['M0.2 0.4 L5.8 0 L0 9.8 L6 9.4'] },
  H: { largura: 5.6, tracos: ['M0 0 L0 10', 'M5.6 0.2 L5.6 10', 'M0 5 L5.6 4.8'] },
  E: { largura: 5.4, tracos: ['M5.2 0 L0 0.2 L0 10 L5.4 9.8', 'M0 5 L4.4 5'] },
  D: { largura: 5.6, tracos: ['M0 0 L0 10', 'M0 0.1 C7.4 -0.2 7.4 10.2 0 9.9'] },
  O: { largura: 6, tracos: ['M3 0 C-0.8 0 -0.8 10 3 10 C6.8 10 6.8 0 3 0 Z'] },
  C: { largura: 5.6, tracos: ['M5.6 1.6 C4.6 -0.6 0 -0.6 0 5 C0 10.6 4.6 10.6 5.6 8.4'] },
  R: { largura: 5.6, tracos: ['M0 10 L0 0 C6.4 -0.2 6.4 5.6 0.2 5.4 L5.6 10'] },
};

export interface TracoLetra {
  d: string;
  transform: string;
}

/**
 * One line of bubble letters: each stroke placed with a little bounce (up/down, tilt), like a
 * hand-painted throw-up. `escala` shrinks the line, `x`/`y` place its top-left corner.
 */
export function linhaDeLetras(texto: string, { x = 0, y = 0, escala = 1, semente = 1, folga = 3.4 } = {}): { tracos: TracoLetra[]; largura: number } {
  const sorte = aleatorio(semente);
  const tracos: TracoLetra[] = [];
  let cursor = 0;
  for (const letra of texto.toUpperCase()) {
    const glifo = GLIFOS[letra];
    if (!glifo) continue;
    const pulo = arred((sorte() - 0.5) * 1.6);
    const giro = arred((sorte() - 0.5) * 12);
    const cx = arred(glifo.largura / 2);
    const transform = `translate(${arred(x + cursor * escala)} ${arred(y + pulo * escala)}) scale(${escala}) rotate(${giro} ${cx} 5)`;
    for (const d of glifo.tracos) tracos.push({ d, transform });
    cursor += glifo.largura + folga;
  }
  return { tracos, largura: arred((cursor - folga) * escala) };
}

/** Letters of `texto` with no glyph in GLIFOS (they would be skipped in the piece). */
export function letrasSemGlifo(texto: string): string[] {
  return [...new Set([...texto.toUpperCase()].filter((letra) => /\S/.test(letra) && !GLIFOS[letra]))];
}

/*
  Doodles, stroked in a 48 x 48 box with round caps: the small marks a writer leaves next to the
  tag. Closed shapes may also be filled by the component.
*/
export const RABISCOS = {
  coroa: ['M9 36 L6 14 L16 23 L24 8 L32 23 L42 14 L39 36 Z', 'M10 42 L38 42'],
  estrela: ['M24 4 L29 18 L44 18 L32 27 L37 42 L24 33 L11 42 L16 27 L4 18 L19 18 Z'],
  seta: ['M5 32 C15 18 28 15 41 19', 'M32 11 L42 19 L32 27'],
  pingos: ['M5 9 C18 7 30 11 43 8', 'M12 9 L12 28', 'M24 10 L24 21', 'M35 9 L35 36', 'M12 31 C9.6 34 10 37 12 37 C14 37 14.4 34 12 31 Z', 'M35 39 C32.6 42 33 45 35 45 C37 45 37.4 42 35 39 Z'],
  raio: ['M28 4 L12 26 L22 26 L17 44 L36 19 L26 19 L31 4 Z'],
  equalizador: ['M8 41 L8 29', 'M16 41 L16 14', 'M24 41 L24 23', 'M32 41 L32 8', 'M40 41 L40 31'],
  palheta: ['M24 44 C14 34 6 22 8 12 C10 4 38 4 40 12 C42 22 34 34 24 44 Z', 'M17 15 L31 15'],
} as const;

export type NomeRabisco = keyof typeof RABISCOS;
export const NOMES_RABISCOS = Object.keys(RABISCOS) as NomeRabisco[];

/*
  "TTD" monogram as a single-line hand tag (120 x 60 box): two flowing Ts, a looped D, a crown on
  top and the swoosh underneath, with one drip.
*/
export const MONOGRAMA = [
  'M7 15 C19 10 33 9 46 12',
  'M26 12 C25 24 23 36 19 49',
  'M39 21 C49 17 60 16 70 18',
  'M55 18 C54 28 53 38 51 47',
  'M72 21 C71 31 70 40 68 48',
  'M71 21 C101 15 106 47 67 48',
  'M5 55 C38 51 78 51 112 43 L103 39',
  'M84 12 L86 3 L92 8 L96 0 L100 8 L106 4 L105 13 Z',
  'M93 47 L93 57',
];

/**
 * Torn paper edge in a `largura` x `altura` box: the top is ragged around the middle (a random
 * walk with small fibres), the shape is closed down to the bottom so it can be filled.
 */
export function bordaRasgada(semente: number, { largura = 1200, altura = 40, passo = 12, amplitude = 7 } = {}): string {
  const sorte = aleatorio(semente);
  const meio = altura * 0.5;
  let y = meio;
  const pontos: string[] = [];
  for (let x = 0; x <= largura; x += passo * (0.5 + sorte())) {
    // Pull back to the middle so the edge never wanders off the box; now and then a deeper tear.
    y += (sorte() - 0.5) * amplitude + (meio - y) * 0.25;
    const fibra = sorte() < 0.12 ? (sorte() - 0.3) * amplitude * 1.6 : 0;
    const altoDoRasgo = Math.min(altura - 3, Math.max(2, y + fibra));
    pontos.push(`${arred(Math.min(x, largura))} ${arred(altoDoRasgo)}`);
  }
  pontos.push(`${largura} ${arred(y)}`);
  return `M0 ${altura} L${pontos.join(' L')} L${largura} ${altura} Z`;
}

export interface Respingo {
  cx: number;
  cy: number;
  r: number;
  opacidade: number;
}

/** Spray overspray: `quantidade` specks, dense at the top edge and thinning out downwards. */
export function respingos(semente: number, quantidade: number, largura: number, altura: number): Respingo[] {
  const sorte = aleatorio(semente);
  return Array.from({ length: quantidade }, () => {
    const profundidade = sorte() ** 2.2;
    return {
      cx: arred(sorte() * largura),
      cy: arred(profundidade * altura),
      r: arred(0.6 + sorte() * (sorte() < 0.08 ? 3.4 : 1.6)),
      opacidade: arred(0.85 - profundidade * 0.6),
    };
  });
}

export interface Pingo {
  // Horizontal position in % of the edge, length and width in px, delay order.
  x: number;
  comprimento: number;
  largura: number;
}

/** Paint drips hanging from an edge: a few, at random spots, of varied length. */
export function pingos(semente: number, quantidade: number): Pingo[] {
  const sorte = aleatorio(semente);
  return Array.from({ length: quantidade }, (_, i) => ({
    x: arred(((i + 0.2 + sorte() * 0.6) / quantidade) * 100),
    comprimento: Math.round(18 + sorte() * 46),
    largura: Math.round(3 + sorte() * 3),
  }));
}

/**
 * Oscilloscope trace across a `largura` x `altura` box: a flat line that bursts into a decaying
 * wave twice, like a snare hit and a bass note on the scope.
 */
export function ondaOsciloscopio(semente: number, largura = 1200, altura = 40): string {
  const sorte = aleatorio(semente);
  const meio = altura / 2;
  const golpes = [0.18 + sorte() * 0.12, 0.58 + sorte() * 0.14];
  const pontos: string[] = [];
  for (let x = 0; x <= largura; x += 5) {
    const t = x / largura;
    const envelope = Math.max(...golpes.map((g) => (t < g ? 0 : Math.exp(-(t - g) * 14))));
    const y = meio + Math.sin(x * 0.19) * envelope * (altura * 0.46) * (0.75 + sorte() * 0.25);
    pontos.push(`${x} ${arred(y)}`);
  }
  return `M${pontos.join(' L')}`;
}

/*
  Stickers: the shapes are drawn by Adesivo.astro, the text comes from content/site.json
  (`adesivos` in each section). Short texts only: they have to fit the die-cut shape.
*/
export const MODELOS_ADESIVO = ['ninja', 'placa', 'etiqueta', 'explosao', 'fita', 'palheta', 'rec'] as const;
export type ModeloAdesivo = (typeof MODELOS_ADESIVO)[number];

/** Splits a short text into two lines of similar length, at a space (for two-line stickers). */
export function duasLinhas(texto: string): [string, string] {
  const palavras = texto.trim().split(/\s+/);
  if (palavras.length < 2) return [texto.trim(), ''];
  let melhor: [string, string] = [palavras[0]!, palavras.slice(1).join(' ')];
  for (let i = 1; i < palavras.length; i++) {
    const a = palavras.slice(0, i).join(' ');
    const b = palavras.slice(i).join(' ');
    if (Math.abs(a.length - b.length) < Math.abs(melhor[0].length - melhor[1].length)) melhor = [a, b];
  }
  return melhor;
}

/** Points of a starburst (lime "explosao" sticker), centred at (cx, cy). */
export function explosao(cx: number, cy: number, externo: number, interno: number, pontas: number, semente = 3): string {
  const sorte = aleatorio(semente);
  const pontos = Array.from({ length: pontas * 2 }, (_, i) => {
    const raio = i % 2 === 0 ? externo * (0.92 + sorte() * 0.08) : interno;
    const angulo = (Math.PI * i) / pontas - Math.PI / 2;
    return `${arred(cx + raio * Math.cos(angulo))} ${arred(cy + raio * Math.sin(angulo))}`;
  });
  return `M${pontos.join(' L')} Z`;
}
