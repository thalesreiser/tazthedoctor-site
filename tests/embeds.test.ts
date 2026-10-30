import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dataLancamento, urlEmbedSoundCloud, urlEmbedYouTube } from '../src/lib/embeds.ts';

test('YouTube embeds use the no-cookie domain and autoplay after the click', () => {
  assert.equal(urlEmbedYouTube('E9EoFOH0T6w'), 'https://www.youtube-nocookie.com/embed/E9EoFOH0T6w?autoplay=1&rel=0&playsinline=1');
  assert.throws(() => urlEmbedYouTube('x"><script>'), /inválido/);
});

test('SoundCloud widget points at the track id, with the accent color and no extras', () => {
  const url = new URL(urlEmbedSoundCloud('2120921334', '#D1932B'));
  assert.equal(url.origin + url.pathname, 'https://w.soundcloud.com/player/');
  assert.equal(url.searchParams.get('url'), 'https://api.soundcloud.com/tracks/2120921334');
  assert.equal(url.searchParams.get('color'), 'D1932B');
  assert.equal(url.searchParams.get('auto_play'), 'true');
  assert.throws(() => urlEmbedSoundCloud('abc', '#000000'), /inválido/);
});

test('release dates are formatted in pt-BR without timezone drift', () => {
  assert.equal(dataLancamento('2025-06-28'), '28 jun. 2025');
  assert.equal(dataLancamento('2025-01-01'), '1 jan. 2025');
});
