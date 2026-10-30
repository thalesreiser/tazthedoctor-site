import type { Conteudo } from './schema.ts';
import { ALTURA_OG, chamadaPrincipal, LARGURA_OG } from './seo.ts';

const MARGEM = 72;
// Right-hand area where og.png.ts places the photo; the text column stays left of it.
export const LARGURA_FOTO_OG = 500;
const LARGURA_TEXTO = LARGURA_OG - LARGURA_FOTO_OG - MARGEM * 2 + 24;
// Average bold glyph width relative to the font size, measured on the widest fallback (DejaVu).
const LARGURA_MEDIA = 0.62;
// Fonts installed on Windows and on the Ubuntu CI runner: the web fonts are not available to sharp.
const PILHA_TITULO = "Impact, 'Arial Black', 'DejaVu Sans', sans-serif";
const PILHA_TEXTO = "Arial, Helvetica, 'Liberation Sans', 'DejaVu Sans', sans-serif";

export function escaparXml(texto: string): string {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Largest font size (up to `maximo`) at which `texto` fits in `largura` px on one line. */
export function tamanhoQueCabe(texto: string, largura: number, maximo: number): number {
  return Math.min(maximo, Math.floor(largura / (Math.max(texto.length, 1) * LARGURA_MEDIA)));
}

/**
 * 1200x630 share card (SVG): artist name, nickname and place on the dark stage color, with a
 * fade into the photo area on the right (the photo itself is composited by og.png.ts).
 */
export function svgCompartilhamento(conteudo: Conteudo): string {
  const { tema, site, artista } = conteudo;
  const inicioFoto = LARGURA_OG - LARGURA_FOTO_OG;
  const tamanhoNome = tamanhoQueCabe(site.nome, LARGURA_TEXTO, 104);
  const apelido = chamadaPrincipal(conteudo);
  const tamanhoApelido = tamanhoQueCabe(apelido, LARGURA_TEXTO, 56);
  const lugar = [artista.bairro, `${artista.cidade}/${artista.uf}`].filter(Boolean).join(' · ').toUpperCase();
  const dominio = site.url ? new URL(site.url).host : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA_OG}" height="${ALTURA_OG}" viewBox="0 0 ${LARGURA_OG} ${ALTURA_OG}">`,
    '<defs>',
    `<linearGradient id="fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${tema.cor_fundo}" stop-opacity="1"/><stop offset="1" stop-color="${tema.cor_fundo}" stop-opacity="0"/></linearGradient>`,
    `<radialGradient id="brilho" cx="0.15" cy="1" r="0.9"><stop offset="0" stop-color="${tema.cor_primaria}" stop-opacity="0.28"/><stop offset="1" stop-color="${tema.cor_primaria}" stop-opacity="0"/></radialGradient>`,
    '</defs>',
    `<rect width="${inicioFoto}" height="${ALTURA_OG}" fill="${tema.cor_fundo}"/>`,
    `<rect width="${inicioFoto}" height="${ALTURA_OG}" fill="url(#brilho)"/>`,
    `<rect x="${inicioFoto}" width="160" height="${ALTURA_OG}" fill="url(#fade)"/>`,
    `<text x="${MARGEM}" y="${MARGEM + 36}" fill="${tema.cor_destaque_frio}" font-family="${PILHA_TEXTO}" font-size="26" font-weight="700" letter-spacing="3">${escaparXml(lugar)}</text>`,
    `<text x="${MARGEM}" y="330" fill="${tema.cor_texto}" font-family="${PILHA_TITULO}" font-size="${tamanhoNome}">${escaparXml(site.nome)}</text>`,
    `<text x="${MARGEM}" y="${330 + tamanhoApelido + 28}" fill="${tema.cor_primaria}" font-family="${PILHA_TITULO}" font-size="${tamanhoApelido}">${escaparXml(apelido)}</text>`,
    dominio
      ? `<text x="${MARGEM}" y="${ALTURA_OG - MARGEM}" fill="${tema.cor_texto_suave}" font-family="${PILHA_TEXTO}" font-size="26">${escaparXml(dominio)}</text>`
      : '',
    `<rect x="0" y="${ALTURA_OG - 12}" width="${LARGURA_OG}" height="12" fill="${tema.cor_destaque}"/>`,
    '</svg>',
  ].join('');
}
