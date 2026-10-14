import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync } from 'node:crypto';
import test from 'node:test';
import { createClerkAuthenticator } from '../src/auth.ts';

// A throwaway key pair stands in for Clerk's signing key, so the real verifyToken runs offline.
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwtKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();

const b64 = (value) => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
function sign(claims, key = privateKey, header = {}) {
  const head = b64({ alg: 'RS256', typ: 'JWT', kid: 'ins_synthetic', ...header });
  const body = b64(claims);
  const signature = createSign('RSA-SHA256').update(`${head}.${body}`).sign(key).toString('base64url');
  return `${head}.${body}.${signature}`;
}
const now = Math.floor(Date.now() / 1000);
const valid = (extra = {}) => ({ sub: 'user_synthetic_1', iss: 'https://clerk.example.test', iat: now - 5, nbf: now - 5, exp: now + 60, ...extra });
const authenticate = createClerkAuthenticator('sk_test_synthetic', { jwtKey });

test('a correctly signed, unexpired session token resolves to its Clerk user id', async () => {
  assert.deepEqual(await authenticate(`Bearer ${sign(valid())}`), { userId: 'user_synthetic_1' });
});
test('a token signed with a different key is rejected', async () => {
  assert.equal(await authenticate(`Bearer ${sign(valid(), other.privateKey)}`), null);
});
test('an expired token is rejected', async () => {
  assert.equal(await authenticate(`Bearer ${sign(valid({ iat: now - 600, nbf: now - 600, exp: now - 300 }))}`), null);
});
test('a token that is not valid yet is rejected', async () => {
  assert.equal(await authenticate(`Bearer ${sign(valid({ nbf: now + 600, iat: now + 600, exp: now + 900 }))}`), null);
});
test('a token without a subject is rejected', async () => {
  const { sub, ...withoutSub } = valid();
  assert.equal(sub, 'user_synthetic_1');
  assert.equal(await authenticate(`Bearer ${sign(withoutSub)}`), null);
});
test('a tampered payload is rejected', async () => {
  const [head, , signature] = sign(valid()).split('.');
  assert.equal(await authenticate(`Bearer ${head}.${b64(valid({ sub: 'user_someone_else' }))}.${signature}`), null);
});
test('an unsigned token (alg none) is rejected', async () => {
  const unsigned = `${b64({ alg: 'none', typ: 'JWT' })}.${b64(valid())}.`;
  assert.equal(await authenticate(`Bearer ${unsigned}`), null);
});
test('missing, malformed or non-bearer headers never reach verification', async () => {
  for (const header of [undefined, '', 'Bearer', 'Bearer ', 'Basic abc', 'bearer abc.def.ghi', 'Bearer a b', 'Bearer not-a-jwt']) {
    assert.equal(await authenticate(header), null, String(header));
  }
});
