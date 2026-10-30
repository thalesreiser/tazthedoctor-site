import { z } from 'astro/zod';
import { PADRAO_FAIXA_SOUNDCLOUD, PADRAO_VIDEO_YOUTUBE } from './embeds.ts';
import { separarPilha } from './fontes.ts';
import { NOMES_ICONES } from './icones.ts';
import { EXTENSOES_IMAGEM, PADRAO_SRC_IMAGEM } from './imagens.ts';
import { ANIMACOES, FUNDOS } from './tema.ts';

const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'use uma cor hexadecimal, ex.: #D1932B');
const https = z.url({ protocol: /^https$/ });

// Google Fonts family self-hosted at build time (see src/lib/fontes.ts).
const fonte = z.object({
  familia: z.string().min(1),
  // Only the weights the page uses: each one is a file the visitor downloads.
  pesos: z.array(z.number().int().min(100).max(900).multipleOf(100)).min(1),
});

// File in src/assets/site/, optimized at build time; width and height come from the file.
const imagem = z.object({
  src: z.string().regex(PADRAO_SRC_IMAGEM, `caminho relativo a src/assets/site/, ex.: "taz.jpg" (${EXTENSOES_IMAGEM.join(', ')})`),
  alt: z.string().min(1, 'descreva a foto em alt'),
});

const acao = z.object({ texto: z.string(), href: z.string() });

// Content still missing, written as notes for Thales. Shown as a dashed "a completar" box while
// em_construcao is true; the schema refuses em_construcao: false while any note is left.
const aCompletar = z.array(z.string().min(3)).default([]);

// Fields every section accepts: `id` is the anchor (defaults to the type), `menu` adds the
// section to the header nav, `ativo: false` hides it and `fundo` fixes its background.
const comum = {
  id: z.string().regex(/^[a-z0-9-]+$/).optional(),
  menu: z.string().optional(),
  ativo: z.boolean().default(true),
  fundo: z.enum(FUNDOS).optional(),
};

const hero = z.object({
  ...comum,
  tipo: z.literal('hero'),
  titulo: z.string(),
  // Nickname shown under the artist name.
  apelido: z.string(),
  selo: z.string().optional(),
  subtitulo: z.string(),
  // Short tags (styles, instrument), shown as chips.
  etiquetas: z.array(z.string()).max(5).default([]),
  foto: imagem,
  acao_principal: acao,
  acao_secundaria: acao.optional(),
  // Words of the ticker strip under the hero (decorative, hidden from screen readers).
  faixa: z.array(z.string().min(1)).default([]),
});

// A release or video. Only what the platform page shows: title, date and the artist's own description.
const lancamentoBase = {
  titulo: z.string(),
  // Short label, e.g. "Faixa" or "Vídeo curto".
  formato: z.string(),
  data: z.iso.date(),
  descricao: z.string().optional(),
  url: https,
};

const lancamento = z.discriminatedUnion('plataforma', [
  z.object({
    ...lancamentoBase,
    plataforma: z.literal('soundcloud'),
    // Numeric track id (the widget URL needs it, the public link does not carry it).
    faixa_id: z.string().regex(PADRAO_FAIXA_SOUNDCLOUD, 'id numérico da faixa no SoundCloud'),
  }),
  z.object({
    ...lancamentoBase,
    plataforma: z.literal('youtube'),
    video_id: z.string().regex(PADRAO_VIDEO_YOUTUBE, 'id de 11 caracteres do vídeo'),
    // Shorts are vertical (9:16); regular videos are horizontal (16:9).
    vertical: z.boolean().default(false),
  }),
]);

const musica = z.object({
  ...comum,
  tipo: z.literal('musica'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  // Shown above the players: they load only after a click.
  aviso_players: z.string(),
  itens: z.array(lancamento).min(1),
  // Honest closing line under the releases (e.g. more recorded than released).
  nota: z.string().optional(),
  a_completar: aCompletar,
});

// What the artist can be hired for; no prices.
const servicos = z.object({
  ...comum,
  tipo: z.literal('servicos'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  itens: z.array(z.object({ icone: z.enum(NOMES_ICONES), titulo: z.string(), descricao: z.string() })).min(1),
});

const registro = z.object({ rotulo: z.string(), valor: z.string(), href: https.optional() });

const sobre = z.object({
  ...comum,
  tipo: z.literal('sobre'),
  titulo: z.string(),
  paragrafos: z.array(z.string()).min(1),
  foto: imagem.optional(),
  registros: z.array(registro).default([]),
  a_completar: aCompletar,
});

const equipamento = z.object({
  ...comum,
  tipo: z.literal('equipamento'),
  titulo: z.string(),
  texto: z.string(),
  foto: imagem,
  itens: z.array(registro).default([]),
  a_completar: aCompletar,
});

const plataformas = z.object({
  ...comum,
  tipo: z.literal('plataformas'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  itens: z
    .array(
      z.object({
        nome: z.string(),
        icone: z.enum(NOMES_ICONES),
        usuario: z.string(),
        descricao: z.string().optional(),
        href: https,
      }),
    )
    .min(1),
  // Up to two photo tiles between the cards (softer photos fit here).
  fotos: z.array(imagem).max(2).default([]),
});

const campo = z.object({
  nome: z.string().regex(/^[a-z_]+$/),
  rotulo: z.string(),
  tipo: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
  obrigatorio: z.boolean().default(true),
  autocomplete: z.string().optional(),
  opcoes: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  ajuda: z.string().optional(),
  erro: z.string().optional(),
});

const contato = z.object({
  ...comum,
  tipo: z.literal('contato'),
  titulo: z.string(),
  texto: z.string().optional(),
  // What the artist takes on, shown as a short list next to the form.
  topicos: z.array(z.string()).default([]),
  texto_email: z.string(),
  provedor: z.enum(['formspree', 'web3forms']),
  // Public form id (Formspree) or access key (Web3Forms). Empty = demo mode, nothing is sent.
  chave: z.string().default(''),
  campos: z
    .array(campo)
    .min(1)
    .refine((campos) => campos.every((c) => c.tipo !== 'select' || (c.opcoes?.length ?? 0) > 0), {
      message: 'campos do tipo select precisam de opcoes',
    }),
  consentimento: z.string(),
  botao: z.string(),
  mensagem_sucesso: z.string(),
  // Call shown in the ticker strip between the contact and the footer, next to contato.email.
  faixa: z.string().optional(),
});

const rodape = z.object({
  ...comum,
  tipo: z.literal('rodape'),
  texto: z.string().optional(),
  // Discreet link to the developer page; no dev content on this site.
  link_dev: z.object({ texto: z.string(), href: https }).optional(),
});

const secao = z.discriminatedUnion('tipo', [hero, musica, servicos, sobre, equipamento, plataformas, contato, rodape]);

// Placeholder e-mail domains, refused once the site leaves "em construção".
export const EMAIL_PROVISORIO = /@example\.(com|org|net)$/i;

export const conteudoSchema = z
  .object({
    // true: visible "em construção" notice and noindex on every page. Set to false only with real content.
    em_construcao: z.boolean(),
    site: z.object({
      nome: z.string(),
      titulo: z.string(),
      descricao: z.string().max(170, 'a descrição de SEO deve ter até 170 caracteres'),
      // Production address: canonical, Open Graph, sitemap and JSON-LD need it.
      url: z.url({ protocol: /^https?$/ }).optional(),
      idioma: z.string().default('pt-BR'),
    }),
    // The artist, for the JSON-LD and the privacy policy.
    artista: z.object({
      nome_artistico: z.string(),
      nome: z.string(),
      apelido: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string(),
      uf: z.string().length(2),
      ano_nascimento: z.number().int().min(1900).max(2100).optional(),
      generos: z.array(z.string()).default([]),
      perfis: z.array(https).default([]),
    }),
    tema: z.object({
      // Dark stage background and the lifted surface (cards, alternate sections).
      cor_fundo: cor,
      cor_superficie: cor,
      cor_texto: cor,
      cor_texto_suave: cor,
      // Buttons and links (sunburst amber), with the text drawn on them.
      cor_primaria: cor,
      cor_primaria_contraste: cor,
      // Kickers and small highlights: warm (pedal LED) and cool (studio light).
      cor_destaque: cor,
      cor_destaque_frio: cor,
      // Cream band (fundo: "creme"): background, text, muted text and link/button color.
      cor_creme: cor,
      cor_creme_texto: cor,
      cor_creme_texto_suave: cor,
      cor_creme_primaria: cor,
      // Spray paint: a more saturated orange for the dripping accent, the tickers and stickers.
      cor_spray: cor,
      fonte_titulo: z.string(),
      fonte_texto: z.string(),
      // Hand-style tag (artist name, stickers) and the dripping paint accent (one or two words).
      fonte_tag: z.string(),
      fonte_tinta: z.string(),
      // Monospace stack for labels; system fonts only, nothing is downloaded.
      fonte_mono: z.string().default('ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'),
      fontes: z.array(fonte).default([]),
      animacoes: z.enum(ANIMACOES).default('sutil'),
    }),
    // The only public contact: e-mail (mailto links carry assunto_email as the subject).
    contato: z.object({
      email: z.email(),
      assunto_email: z.string(),
    }),
    rastreamento: z
      .object({
        google_analytics: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
        meta_pixel: z.string().regex(/^\d+$/).optional(),
        // Cookie consent banner, shown only when an id above is set.
        aviso_cookies: z
          .object({
            texto: z
              .string()
              .default(
                'Uso cookies de medição de audiência para entender como o site é usado. Eles só são ativados se você aceitar.',
              ),
            aceitar: z.string().default('Aceitar'),
            recusar: z.string().default('Recusar'),
          })
          .prefault({}),
      })
      .prefault({}),
    // Words the copy must never use (hype, invented numbers); tests/conteudo.test.ts fails when any text contains one.
    revisao: z.object({ termos_vetados: z.array(z.string().min(2)).min(1) }),
    secoes: z.array(secao).min(1),
  })
  .superRefine((conteudo, ctx) => {
    const ids = conteudo.secoes.map(ancoraSecao);
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (repetidos.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['secoes'], message: `ids de seção repetidos: ${[...new Set(repetidos)].join(', ')}` });
    }
    const pilhas = pilhasDoTema(conteudo.tema).flatMap(separarPilha).map((nome) => nome.toLowerCase());
    conteudo.tema.fontes.forEach((f, i) => {
      if (!pilhas.includes(f.familia.toLowerCase())) {
        ctx.addIssue({ code: 'custom', path: ['tema', 'fontes', i, 'familia'], message: `"${f.familia}" não aparece em fonte_titulo, fonte_texto, fonte_tag nem fonte_tinta` });
      }
    });
    conteudo.secoes.forEach((s, i) => {
      if (s.tipo === 'contato' && s.fundo === 'creme') {
        ctx.addIssue({ code: 'custom', path: ['secoes', i, 'fundo'], message: 'o contato não aceita fundo "creme"; use "palco" ou "superficie"' });
      }
    });
    // Leaving "em construção" requires a real e-mail, a working form and no pending notes.
    if (!conteudo.em_construcao) {
      if (EMAIL_PROVISORIO.test(conteudo.contato.email)) {
        ctx.addIssue({ code: 'custom', path: ['contato', 'email'], message: 'e-mail provisório: preencha o e-mail real antes de tirar em_construcao' });
      }
      conteudo.secoes.forEach((s, i) => {
        if (s.tipo === 'contato' && s.ativo && s.chave === '') {
          ctx.addIssue({ code: 'custom', path: ['secoes', i, 'chave'], message: 'formulário sem chave: preencha a chave do provedor ou use "ativo": false' });
        }
        if ('a_completar' in s && s.ativo && s.a_completar.length > 0) {
          ctx.addIssue({ code: 'custom', path: ['secoes', i, 'a_completar'], message: 'ainda há itens a completar nesta seção' });
        }
      });
    }
  });

export type Conteudo = z.output<typeof conteudoSchema>;
export type Secao = Conteudo['secoes'][number];
export type SecaoDo<T extends Secao['tipo']> = Extract<Secao, { tipo: T }>;
export type Imagem = z.output<typeof imagem>;
export type Lancamento = z.output<typeof lancamento>;

/** Font stacks that may use the self-hosted families, in fallback lookup order. */
export function pilhasDoTema(tema: Pick<Conteudo['tema'], 'fonte_titulo' | 'fonte_texto' | 'fonte_tag' | 'fonte_tinta'>): string[] {
  return [tema.fonte_titulo, tema.fonte_texto, tema.fonte_tag, tema.fonte_tinta];
}

/** Anchor id of a section: its `id`, or its type in kebab-case. */
export function ancoraSecao(secao: { id?: string | undefined; tipo: string }): string {
  return secao.id ?? secao.tipo.replaceAll('_', '-');
}
