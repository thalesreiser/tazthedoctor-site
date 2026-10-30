// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { reservasDaFonte, variavelFonte } from './src/lib/fontes.ts';

// The whole site comes from content/site.json; the page validates it with the full schema
// (src/lib/schema.ts), here only the fields the config needs are read.
const dados = JSON.parse(readFileSync(new URL('./content/site.json', import.meta.url), 'utf8'));

// `site` (canonical, sitemap, robots.txt) comes from site.url; without it the sitemap is skipped.
const site = dados.site?.url;

// tema.fontes is downloaded at build time and served from the site (Astro Fonts API).
/** @type {import('./src/lib/fontes.ts').FonteSite[]} */
const fontes = Array.isArray(dados.tema?.fontes) ? dados.tema.fontes : [];
const pilhas = [dados.tema?.fonte_titulo ?? '', dados.tema?.fonte_texto ?? ''];
const fonts = fontes.map((fonte) => {
  const reservas = reservasDaFonte(fonte.familia, pilhas);
  return {
    name: fonte.familia,
    cssVariable: variavelFonte(fonte.familia),
    provider: fontProviders.google(),
    weights: /** @type {[number, ...number[]]} */ (fonte.pesos),
    styles: /** @type {['normal']} */ (['normal']),
    subsets: /** @type {['latin']} */ (['latin']),
    formats: /** @type {['woff2']} */ (['woff2']),
    ...(reservas.length > 0 && { fallbacks: reservas }),
  };
});

// https://astro.build/config
export default defineConfig({
  site,
  fonts,
  integrations: site ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
