/** mailto link with a prefilled subject (encoded per RFC 6068: spaces as %20, never "+"). */
export function linkEmail(email: string, assunto?: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`E-mail inválido: "${email}"`);
  return assunto ? `mailto:${email}?subject=${encodeURIComponent(assunto)}` : `mailto:${email}`;
}
