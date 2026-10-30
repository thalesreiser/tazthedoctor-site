import type { APIRoute } from 'astro';
import { join } from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import { carregarConteudo } from '../lib/conteudo.ts';
import { caminhoImagem } from '../lib/imagens.ts';
import { LARGURA_FOTO_OG, svgCompartilhamento } from '../lib/og.ts';
import { ALTURA_OG, LARGURA_OG } from '../lib/seo.ts';

// Share image for Open Graph/Twitter, rendered once at build time: the equipment photo
// (guitar and pedals) on the right, the generated text card over the rest.
export const GET: APIRoute = async () => {
  const conteudo = carregarConteudo();
  const equipamento = conteudo.secoes.find((secao) => secao.tipo === 'equipamento');
  const hero = conteudo.secoes.find((secao) => secao.tipo === 'hero');
  const foto = equipamento?.tipo === 'equipamento' ? equipamento.foto : hero?.tipo === 'hero' ? hero.foto : undefined;

  const camadas: OverlayOptions[] = [];
  if (foto) {
    // The bundled endpoint runs from another folder at build time, so resolve from the project root.
    const arquivo = join(process.cwd(), caminhoImagem(foto.src));
    const recorte = await sharp(arquivo).resize(LARGURA_FOTO_OG, ALTURA_OG, { fit: 'cover', position: 'attention' }).toBuffer();
    camadas.push({ input: recorte, left: LARGURA_OG - LARGURA_FOTO_OG, top: 0 });
  }
  camadas.push({ input: Buffer.from(svgCompartilhamento(conteudo)), left: 0, top: 0 });

  const png = await sharp({ create: { width: LARGURA_OG, height: ALTURA_OG, channels: 3, background: conteudo.tema.cor_fundo } })
    .composite(camadas)
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
