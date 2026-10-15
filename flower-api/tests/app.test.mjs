import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.ts';

const VALID = { name: 'Jane Doe', countryIso: 'CM', phone: '671234567', gender: 'female' };

// Tokens are fake here: this authenticator maps "Bearer token-<id>" to user "<id>".
const authenticate = async (header) => {
  const match = /^Bearer token-(\w+)$/.exec(header ?? '');
  return match ? { userId: match[1] } : null;
};
function memoryStore() {
  const rows = new Map();
  return {
    rows,
    get: async (userId) => rows.get(userId) ?? null,
    upsert: async (userId, values) => {
      const previous = rows.get(userId);
      const record = { ...values, createdAt: previous?.createdAt ?? 'created', updatedAt: 'updated' };
      rows.set(userId, record);
      return record;
    },
  };
}
// By default every user has a photo; individual tests pass `photos` to change that.
const unusedLocationStore = { get: async () => null, upsert: async () => { throw new Error('profile tests never save a location'); } };
const setup = (store = memoryStore(), photos = async () => true) => ({ store, app: createApp({ authenticate, store, locationStore: unusedLocationStore, hasProfilePhoto: photos }) });
const as = (id, extra = {}) => ({ authorization: `Bearer token-${id}`, ...extra });
const put = (app, id, body, headers = {}) => app.request('/v1/profile', {
  method: 'PUT', headers: as(id, { 'content-type': 'application/json', ...headers }), body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('health check is public and reveals nothing', async () => {
  const { app } = setup();
  const response = await app.request('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
test('every profile route needs a valid session', async () => {
  const { app, store } = setup();
  for (const headers of [{}, { authorization: 'Bearer wrong' }, { authorization: 'Basic abc' }]) {
    const get = await app.request('/v1/profile', { headers });
    assert.equal(get.status, 401);
    const write = await app.request('/v1/profile', { method: 'PUT', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(VALID) });
    assert.equal(write.status, 401);
  }
  assert.equal(store.rows.size, 0);
});
test('an unauthenticated request is refused before its body is read or validated', async () => {
  const { app } = setup();
  const response = await app.request('/v1/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{not json' });
  assert.equal(response.status, 401);
});
test('a user without a profile gets null, which the app treats as "not complete"', async () => {
  const { app } = setup();
  const response = await app.request('/v1/profile', { headers: as('a') });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { profile: null });
});
test('saving stores the normalized profile under the verified user and returns it', async () => {
  const { app, store } = setup();
  const response = await put(app, 'a', VALID);
  assert.equal(response.status, 200);
  const { profile } = await response.json();
  assert.equal(profile.phoneE164, '+237671234567');
  assert.equal(store.rows.get('a').name, 'Jane Doe');
  const read = await (await app.request('/v1/profile', { headers: as('a') })).json();
  assert.deepEqual(read.profile, profile);
});
test('the user id in the body is ignored: the token decides whose profile is written', async () => {
  const { app, store } = setup();
  await put(app, 'a', { ...VALID, userId: 'b', clerk_user_id: 'b', clerkUserId: 'b' });
  assert.deepEqual([...store.rows.keys()], ['a']);
});
test('users can only read their own profile', async () => {
  const { app } = setup();
  await put(app, 'a', VALID);
  assert.deepEqual(await (await app.request('/v1/profile', { headers: as('b') })).json(), { profile: null });
});
test('saving twice updates the same profile', async () => {
  const { app, store } = setup();
  await put(app, 'a', VALID);
  await put(app, 'a', { ...VALID, name: 'Jane Smith' });
  assert.equal(store.rows.size, 1);
  assert.equal(store.rows.get('a').name, 'Jane Smith');
});
test('invalid input is rejected with field errors and nothing is stored', async () => {
  const { app, store } = setup();
  const response = await put(app, 'a', { name: '', countryIso: 'CM', phone: '1', gender: 'x' });
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.error, 'validation_failed');
  assert.deepEqual(Object.keys(body.fields).sort(), ['gender', 'name', 'phone']);
  // An unknown country is reported on its own: the phone cannot be checked without one.
  const unknown = await (await put(app, 'a', { ...VALID, countryIso: 'ZZ' })).json();
  assert.deepEqual(Object.keys(unknown.fields), ['country']);
  assert.equal(store.rows.size, 0);
});
test('non-JSON content types and broken JSON are refused', async () => {
  const { app, store } = setup();
  assert.equal((await put(app, 'a', JSON.stringify(VALID), { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await app.request('/v1/profile', { method: 'PUT', headers: as('a'), body: JSON.stringify(VALID) })).status, 415);
  assert.equal((await put(app, 'a', '{not json')).status, 400);
  assert.equal(store.rows.size, 0);
});
test('oversized bodies are refused', async () => {
  const { app, store } = setup();
  const response = await put(app, 'a', { ...VALID, padding: 'x'.repeat(10_000) });
  assert.equal(response.status, 413);
  assert.equal(store.rows.size, 0);
});
test('private responses are never cacheable and carry security headers', async () => {
  const { app } = setup();
  for (const response of [await app.request('/v1/profile', { headers: as('a') }), await put(app, 'a', VALID), await app.request('/v1/profile')]) {
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
});
test('unknown routes and methods get a plain JSON 404', async () => {
  const { app } = setup();
  assert.equal((await app.request('/nope')).status, 404);
  assert.equal((await app.request('/v1/profile', { method: 'DELETE', headers: as('a') })).status, 404);
});
test('storage failures return a generic 500 and do not leak details', async () => {
  const log = console.error;
  console.error = () => {};
  try {
    const store = { get: async () => { throw new Error('connection string postgres://user:secret@host/db'); }, upsert: async () => { throw new Error('secret detail'); } };
    const { app } = setup(store);
    for (const response of [await app.request('/v1/profile', { headers: as('a') }), await put(app, 'a', VALID)]) {
      assert.equal(response.status, 500);
      const text = await response.text();
      assert.deepEqual(JSON.parse(text), { error: 'server_error' });
      assert.ok(!text.includes('secret'));
    }
  } finally {
    console.error = log;
  }
});
test('browsers get no cross-origin access: there is no CORS header', async () => {
  const { app } = setup();
  const response = await app.request('/v1/profile', { headers: as('a', { origin: 'https://evil.example' }) });
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('a profile cannot be saved for a user who has no profile photo in Clerk', async () => {
  const { app, store } = setup(memoryStore(), async () => false);
  const response = await put(app, 'a', VALID);
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: 'validation_failed', fields: { photo: 'Add a profile photo.' } });
  assert.equal(store.rows.size, 0);
});
test('the photo is checked for the verified user, never for an id sent in the body', async () => {
  const asked = [];
  const { app } = setup(memoryStore(), async (userId) => { asked.push(userId); return true; });
  await put(app, 'a', { ...VALID, clerkUserId: 'someone-else', userId: 'someone-else' });
  assert.deepEqual(asked, ['a']);
});
test('Clerk is not asked about the photo when the other fields are already invalid', async () => {
  const { app } = setup(memoryStore(), async () => assert.fail('must not call Clerk'));
  const response = await put(app, 'a', { ...VALID, name: '' });
  assert.equal(response.status, 422);
  assert.ok((await response.json()).fields.name);
});
test('a Clerk failure while checking the photo is a server error and saves nothing', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const { app, store } = setup(memoryStore(), async () => { throw new Error('synthetic clerk outage'); });
    const response = await put(app, 'a', VALID);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'server_error' });
    assert.equal(store.rows.size, 0);
  } finally {
    console.error = original;
  }
});
