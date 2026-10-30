// Stroke icons on a 24x24 grid, drawn with currentColor. Names are what content/site.json uses in `icone`.
// Platform marks are simplified line drawings, always shown next to the platform name.
export const ICONES = {
  soundcloud: ['M3 16.5v-3', 'M6 17v-5', 'M9 17V9.5', 'M12 17V8a6 6 0 0 1 5.8 4.4A2.6 2.6 0 0 1 21 15a2 2 0 0 1-2 2Z'],
  youtube: [
    'M2.5 7.1a3 3 0 0 1 2.1-2.1C6.5 4.5 12 4.5 12 4.5s5.5 0 7.4.5a3 3 0 0 1 2.1 2.1c.5 1.9.5 4.9.5 4.9s0 3-.5 4.9a3 3 0 0 1-2.1 2.1c-1.9.5-7.4.5-7.4.5s-5.5 0-7.4-.5a3 3 0 0 1-2.1-2.1C2 15 2 12 2 12s0-3 .5-4.9Z',
    'm10 15 5-3-5-3Z',
  ],
  tiktok: ['M15.5 3c.4 2.5 2 4 4.5 4.3v3.2c-1.6 0-3.1-.5-4.4-1.4v6.4A5.6 5.6 0 1 1 10 10v3.3a2.3 2.3 0 1 0 2.3 2.3V3Z'],
  instagram: ['M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z', 'M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4Z', 'M17.5 6.5h.01'],
  threads: [
    'M18.5 7.5C17.2 4.3 14.8 2.5 12 2.5 6.8 2.5 3.5 6.3 3.5 12s3.3 9.5 8.5 9.5c4 0 7-2.3 7-5.8 0-3.1-2.6-5-6.1-5-2.6 0-4.3 1.4-4.3 3.2 0 1.7 1.5 2.8 3.4 2.8 2.8 0 4.4-2.1 4.4-6',
  ],
  linktree: ['M12 22v-9', 'M4 9h16', 'M7 4.5 12 9l5-4.5', 'M7 14.5 12 9l5 5.5'],
  play: ['M7 4.5v15l12.5-7.5Z'],
  // Mixing console faders.
  faders: ['M5 3v18', 'M12 3v18', 'M19 3v18', 'M3 14h4', 'M10 7h4', 'M17 16h4'],
  // Waveform: production.
  onda: ['M2 12h2', 'M6 8v8', 'M10 4v16', 'M14 7v10', 'M18 10v4', 'M22 12h-2'],
  guitarra: [
    'm14 10 6.5-6.5',
    'M19 2.5 21.5 5',
    'M11.5 9.5c-1.4-1.4-3.6-1.1-4.6.6l-.6 1a2 2 0 0 1-1.5 1C2.6 12.4 1.8 15 3.4 16.6l4 4c1.6 1.6 4.2.8 4.5-1.4a2 2 0 0 1 1-1.5l1-.6c1.7-1 2-3.2.6-4.6Z',
    'm8 13 3 3',
  ],
  microfone: ['M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z', 'M19 10v1a7 7 0 0 1-14 0v-1', 'M12 18v4', 'M8 22h8'],
  mensagem: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  email: ['M3 5h18v14H3Z', 'm3 7 9 6 9-6'],
  externo: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
  seta: ['M5 12h14', 'm13 6 6 6-6 6'],
} as const;

export type NomeIcone = keyof typeof ICONES;

export const NOMES_ICONES = Object.keys(ICONES) as [NomeIcone, ...NomeIcone[]];
