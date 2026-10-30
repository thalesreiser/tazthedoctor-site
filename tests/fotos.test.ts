import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Committed photos must carry no camera metadata (location, device, dates) and stay small.
const pasta = fileURLToPath(new URL('../src/assets/site/', import.meta.url));
const fotos = readdirSync(pasta).filter((nome) => /\.(jpe?g|png|webp|avif)$/i.test(nome));

test('there are photos to check', () => {
  assert.ok(fotos.length > 0);
});

for (const nome of fotos) {
  test(`${nome}: no EXIF, XMP, IPTC or ICC, upright, long side up to 1600 px`, async () => {
    const m = await sharp(`${pasta}${nome}`).metadata();
    assert.equal(m.exif, undefined, 'exif');
    assert.equal(m.xmp, undefined, 'xmp');
    assert.equal(m.iptc, undefined, 'iptc');
    assert.equal(m.icc, undefined, 'icc');
    assert.ok(!m.orientation || m.orientation === 1, 'orientation');
    assert.ok(Math.max(m.width, m.height) <= 1600, `${m.width}x${m.height}`);
  });
}
