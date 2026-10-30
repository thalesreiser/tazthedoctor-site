import assert from 'node:assert/strict';
import { test } from 'node:test';
import { linkEmail } from '../src/lib/email.ts';

test('builds a mailto link with the subject percent-encoded', () => {
  assert.equal(linkEmail('tazthedoctor@gmail.com', 'Trabalho com o Taz & cia'), 'mailto:tazthedoctor@gmail.com?subject=Trabalho%20com%20o%20Taz%20%26%20cia');
  assert.equal(linkEmail('tazthedoctor@gmail.com'), 'mailto:tazthedoctor@gmail.com');
});

test('rejects something that is not an e-mail', () => {
  assert.throws(() => linkEmail('tazthedoctor'), /inválido/);
});
