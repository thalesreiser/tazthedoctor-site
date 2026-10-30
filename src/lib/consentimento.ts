// Cookie consent (LGPD) and conversion events: pure decisions, used by AvisoCookies.astro.

export type Escolha = 'aceito' | 'recusado';
export type Conversao = 'email' | 'formulario';

/** localStorage key that keeps the visitor's choice. */
export const CHAVE_CONSENTIMENTO = 'consentimento-cookies';

interface Armazenamento {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

/** Tracking ids from content/site.json; only the configured tools are loaded. */
export interface Ferramentas {
  google_analytics?: string | undefined;
  meta_pixel?: string | undefined;
}

export function temRastreamento(ferramentas: Ferramentas): boolean {
  return Boolean(ferramentas.google_analytics || ferramentas.meta_pixel);
}

/**
 * Reads the stored choice. Takes a getter because merely touching `localStorage`
 * throws when storage is blocked; any failure counts as "no choice yet".
 */
export function lerEscolha(armazenamento: () => Armazenamento): Escolha | null {
  try {
    const valor = armazenamento().getItem(CHAVE_CONSENTIMENTO);
    return valor === 'aceito' || valor === 'recusado' ? valor : null;
  } catch {
    return null;
  }
}

/** Stores the choice; returns false when storage is unavailable (the choice then lasts one page view). */
export function gravarEscolha(armazenamento: () => Armazenamento, escolha: Escolha): boolean {
  try {
    armazenamento().setItem(CHAVE_CONSENTIMENTO, escolha);
    return true;
  } catch {
    return false;
  }
}

/** Tracking scripts load only after an explicit "Aceitar". */
export function podeRastrear(escolha: Escolha | null): boolean {
  return escolha === 'aceito';
}

/** The banner shows by itself only while the visitor has not chosen. */
export function mostrarAviso(escolha: Escolha | null): boolean {
  return escolha === null;
}

/** True for links that open an e-mail to the artist (mailto:). */
export function ehLinkEmail(href: string): boolean {
  try {
    const { protocol, pathname } = new URL(href);
    return protocol === 'mailto:' && pathname.includes('@');
  } catch {
    return false;
  }
}

export type Chamada =
  | { ferramenta: 'google_analytics'; argumentos: ['event', 'generate_lead', { method: 'email' | 'form' }] }
  | { ferramenta: 'meta_pixel'; argumentos: ['track', 'Contact' | 'Lead'] };

/**
 * Calls to make for a conversion: GA4 `generate_lead` (method `email` or `form`)
 * and Meta Pixel `Contact` (e-mail) or `Lead` (form), only for the configured tools.
 */
export function chamadasConversao(conversao: Conversao, ferramentas: Ferramentas): Chamada[] {
  const chamadas: Chamada[] = [];
  if (ferramentas.google_analytics) {
    chamadas.push({ ferramenta: 'google_analytics', argumentos: ['event', 'generate_lead', { method: conversao === 'email' ? 'email' : 'form' }] });
  }
  if (ferramentas.meta_pixel) {
    chamadas.push({ ferramenta: 'meta_pixel', argumentos: ['track', conversao === 'email' ? 'Contact' : 'Lead'] });
  }
  return chamadas;
}
