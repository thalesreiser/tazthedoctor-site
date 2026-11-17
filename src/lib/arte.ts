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
  "Ninja" as a single-line hand tag (120 x 60 box): a tall N with a crown, the lower-case letters
  in one flow, the swoosh underneath and one drip.
*/
export const MONOGRAMA = [
  'M6 48 C7 36 8 24 10 12 C16 26 22 38 28 48 C29 36 30 24 31 12',
  'M38 30 C38 36 38 42 38 48',
  'M38 21 L38.6 22.2',
  'M46 48 C46 40 46 34 47 30 C52 26 60 27 60 34 C60 39 60 44 60 48',
  'M70 30 C70 40 70 50 68 55 C66 59 60 59 58 55',
  'M70.4 21 L71 22.2',
  'M92 34 C86 28 78 30 78 39 C78 47 88 49 92 40 C92 44 93 47 96 48',
  'M4 58 C40 54 80 54 114 46 L105 42',
  'M3 9 L5 1 L10 6 L14 -1 L18 6 L23 2 L22 10 Z',
  'M104 47 L104 57',
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
export const MODELOS_ADESIVO = ['ninja', 'placa', 'etiqueta', 'explosao', 'fita', 'palheta', 'rec', 'tarja', 'isqueiro', 'piteira'] as const;
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

/*
  Drawn logo, "gótico afiado" (Logo.astro): blackletter letters built from broad-nib pieces (stems
  with diamond feet, bars, a few thorns), each letter with its own tilt and height so they dance on
  the line. Polygons in a 200-unit cap height, baseline at y = 200. Only these letters are drawn, so
  the logo is used only while the site name is exactly LOGO_NOME; any other name falls back to type.
*/
export const LOGO_NOME = 'TazTheDoctor';

export interface LetraLogo {
  pontos: string[];
  transform?: string;
}

export const LOGO_TAZ: LetraLogo[] = [
  {
    // T: bar with a hanging spur, stem, foot flick, a thorn on the stem and one off the bar.
    transform: 'rotate(-4 80 100)',
    pontos: [
      '4,22 26,2 146,2 160,18 138,34 24,34',
      '4,22 18,30 12,64 2,48',
      '62,22 76,10 90,22 90,188 76,200 62,188',
      '84,186 112,170 124,180 94,204',
      '62,104 40,114 62,128',
      '146,2 168,-14 160,18',
    ],
  },
  {
    // a: tall right stem, short bowl stem, top bar, two joins and a thorn.
    transform: 'translate(-4 8) rotate(4 214 140)',
    pontos: [
      '225,92 239,80 253,92 253,188 239,200 225,188',
      '178,104 200,80 240,80 240,100 204,100 190,116',
      '175,132 189,120 203,132 203,184 189,196 175,184',
      '190,128 203,118 238,128 238,142 203,136',
      '190,190 203,200 238,180 238,164',
      '253,122 274,132 253,144',
    ],
  },
  {
    // z: top bar with a thorn, diagonal, bottom bar (the arrow leaves from here).
    transform: 'translate(-8 -6) rotate(-6 314 140)',
    pontos: [
      '270,92 284,80 340,80 352,90 340,104 282,104',
      '330,100 354,100 298,180 274,180',
      '272,186 286,174 346,174 358,186 344,200 284,200',
      '300,80 310,56 320,80',
    ],
  },
];

export const LOGO_DOCTOR: LetraLogo[] = [
  {
    transform: 'rotate(-3 80 100)',
    pontos: ['4,22 26,2 146,2 160,18 138,34 24,34', '62,22 76,10 90,22 90,188 76,200 62,188', '84,186 112,170 124,180 94,204'],
  },
  {
    transform: 'rotate(2 210 106)',
    pontos: [
      '170,12 184,0 198,12 198,188 184,200 170,188',
      '196,112 216,88 238,86 252,100 252,118 236,104 198,130',
      '224,108 238,96 252,108 252,200 238,212 224,200',
      '170,58 150,68 170,80',
    ],
  },
  {
    transform: 'translate(0 -4) rotate(-3 296 140)',
    pontos: [
      '265,96 279,84 293,96 293,184 279,196 265,184',
      '288,84 312,80 328,94 324,126 296,140 292,124 306,112 304,100 292,100',
      '288,186 300,200 332,184 326,170',
    ],
  },
  {
    transform: 'rotate(3 400 100)',
    pontos: [
      '345,12 359,0 373,12 373,188 359,200 345,188',
      '365,0 420,4 450,30 456,100 450,170 420,196 365,200 365,172 412,168 426,140 428,100 424,56 410,30 365,28',
      '455,88 476,98 455,112',
    ],
  },
  {
    transform: 'translate(0 -8)',
    pontos: [
      '472,96 486,84 500,96 500,184 486,196 472,184',
      '518,96 532,84 546,96 546,184 532,196 518,184',
      '482,92 500,78 532,78 544,90 532,100 492,100',
      '482,188 494,202 534,202 546,188 532,178 494,178',
    ],
  },
  {
    transform: 'translate(0 4) rotate(-4 590 140)',
    pontos: ['560,96 574,84 588,96 588,184 574,196 560,184', '572,92 592,78 618,80 622,102 602,96 586,104', '574,188 586,202 620,192 614,178 588,180'],
  },
  {
    transform: 'rotate(3 650 120)',
    pontos: ['632,52 646,40 660,52 660,184 646,196 632,184', '620,86 680,86 680,102 620,102', '650,188 662,202 688,190 682,176', '640,44 646,20 652,44'],
  },
  {
    transform: 'translate(0 6)',
    pontos: [
      '698,96 712,84 726,96 726,184 712,196 698,184',
      '744,96 758,84 772,96 772,184 758,196 744,184',
      '708,92 726,78 758,78 770,90 758,100 718,100',
      '708,188 720,202 760,202 772,188 758,178 720,178',
    ],
  },
  {
    // r: the yellow arrow leaves from its flag (Logo.astro, same transform).
    transform: 'translate(0 -4) rotate(-5 818 140)',
    pontos: ['786,96 800,84 814,96 814,188 800,200 786,188', '806,94 830,78 852,84 848,106 826,98 812,110'],
  },
];
