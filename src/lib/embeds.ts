// Click-to-load players: the page ships only a link styled as a player; the third-party iframe
// is built from these URLs after the visitor clicks (Player.astro). Nothing loads before that.

export const PADRAO_VIDEO_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
export const PADRAO_FAIXA_SOUNDCLOUD = /^\d{1,15}$/;

/** youtube-nocookie embed that starts playing, since the visitor already pressed play. */
export function urlEmbedYouTube(videoId: string): string {
  if (!PADRAO_VIDEO_YOUTUBE.test(videoId)) throw new Error(`Id de vídeo do YouTube inválido: "${videoId}"`);
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
}

/** Compact SoundCloud widget for one track, in the page accent color. */
export function urlEmbedSoundCloud(faixaId: string, cor: string): string {
  if (!PADRAO_FAIXA_SOUNDCLOUD.test(faixaId)) throw new Error(`Id de faixa do SoundCloud inválido: "${faixaId}"`);
  const params = new URLSearchParams({
    url: `https://api.soundcloud.com/tracks/${faixaId}`,
    color: cor.replace('#', ''),
    auto_play: 'true',
    show_comments: 'false',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  });
  return `https://w.soundcloud.com/player/?${params}`;
}

/** Date as "28 jun. 2025" (pt-BR, fixed UTC so the build machine's timezone never shifts it). */
export function dataLancamento(iso: string): string {
  const data = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(data)
    .replaceAll(' de ', ' ');
}
