import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { createApp } from '../src/app.ts';
import { createSqlLocationStore } from '../src/location-store.ts';
import { roundCoordinate, validateLocation } from '../src/location-validation.ts';

const VALID = { placeName: 'Douala, Littoral, Cameroon', latitude: 4.0511, longitude: 9.7679 };

// ---- validation ---------------------------------------------------------------------------
test('coordinates are rounded to two decimals (about 1 km) whatever precision was sent', () => {
  const result = validateLocation({ ...VALID, latitude: 4.05149999, longitude: 9.76791234 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { placeName: VALID.placeName, latitude: 4.05, longitude: 9.77 });
  assert.equal(roundCoordinate(-0.004), 0);
  assert.ok(Object.is(roundCoordinate(-0.004), 0), 'negative zero must not be stored');
  assert.equal(roundCoordinate(-33.8688197), -33.87);
  assert.equal(roundCoordinate(90), 90);
  assert.equal(roundCoordinate(-180), -180);
});
test('the place name is trimmed and its spaces collapsed', () => {
  assert.equal(validateLocation({ ...VALID, placeName: '  Douala,   Cameroon \n' }).value.placeName, 'Douala, Cameroon');
});
test('bad place names are refused', () => {
  for (const placeName of ['', ' ', 'D', '--', '...', 'x'.repeat(121), 'Dou\u0000ala', 'Dou\u0007ala', 42, null, undefined, {}]) {
    const result = validateLocation({ ...VALID, placeName });
    assert.equal(result.ok, false, JSON.stringify(placeName));
    assert.ok(result.errors.placeName);
  }
  assert.equal(validateLocation({ ...VALID, placeName: 'x'.repeat(120) }).ok, true);
  assert.equal(validateLocation({ ...VALID, placeName: 'Yaoundé' }).ok, true);
  assert.equal(validateLocation({ ...VALID, placeName: '東京都' }).ok, true);
});
test('only real in-range numbers are accepted as coordinates', () => {
  for (const latitude of [91, -91, NaN, Infinity, -Infinity, '4.05', null, undefined, true, [], {}]) {
    assert.deepEqual(Object.keys(validateLocation({ ...VALID, latitude }).errors), ['latitude'], String(latitude));
  }
  for (const longitude of [181, -181, NaN, Infinity, '9.77', null, undefined, false, []]) {
    assert.deepEqual(Object.keys(validateLocation({ ...VALID, longitude }).errors), ['longitude'], String(longitude));
  }
  assert.equal(validateLocation({ ...VALID, latitude: 90, longitude: 180 }).ok, true);
  assert.equal(validateLocation({ ...VALID, latitude: -90, longitude: -180 }).ok, true);
  assert.equal(validateLocation({ ...VALID, latitude: 0, longitude: 0 }).ok, true);
});
test('anything that is not an object is a validation failure, never a crash', () => {
  for (const input of [null, undefined, 'text', 5, [], true]) assert.equal(validateLocation(input).ok, false);
});
test('unknown fields in the body are dropped, not stored', () => {
  const result = validateLocation({ ...VALID, clerkUserId: 'b', isAdmin: true });
  assert.deepEqual(Object.keys(result.value).sort(), ['latitude', 'longitude', 'placeName']);
});

// ---- store, against a real PostgreSQL engine ----------------------------------------------
const migrations = join(import.meta.dirname, '..', 'migrations');
async function freshDatabase() {
  const db = new PGlite();
  for (const file of (await readdir(migrations)).filter((name) => name.endsWith('.sql')).sort()) {
    await db.query(await readFile(join(migrations, file), 'utf8'));
  }
  const query = async (text, params) => (await db.query(text, params)).rows;
  return { db, query, store: createSqlLocationStore(query) };
}
const rounded = { placeName: 'Douala, Littoral, Cameroon', latitude: 4.05, longitude: 9.77 };

test('a missing location is null', async () => {
  const { store } = await freshDatabase();
  assert.equal(await store.get('user_a'), null);
});
test('upsert creates a location and get reads the same numbers back', async () => {
  const { store } = await freshDatabase();
  const saved = await store.upsert('user_a', rounded);
  assert.equal(saved.placeName, rounded.placeName);
  assert.strictEqual(saved.latitude, 4.05);
  assert.strictEqual(saved.longitude, 9.77);
  assert.match(saved.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(await store.get('user_a'), saved);
});
test('every value the validator can produce is accepted by the database constraint', async () => {
  const { store } = await freshDatabase();
  const samples = [[4.0511, 9.7679], [-33.8688197, 151.2092955], [-0.004, 0.004], [90, 180], [-90, -180], [0.005, -0.005], [48.8566, 2.3522], [1.005, 1.015], [-1.005, 179.995]];
  for (const [latitude, longitude] of samples) {
    const result = validateLocation({ ...VALID, latitude, longitude });
    await store.upsert('user_a', result.value); // would throw if JavaScript and PostgreSQL rounded differently
  }
});
test('upsert updates the same row, keeping created_at and moving updated_at', async () => {
  const { store, query } = await freshDatabase();
  const first = await store.upsert('user_a', rounded);
  await new Promise((resolve) => setTimeout(resolve, 15));
  const second = await store.upsert('user_a', { placeName: 'Yaoundé, Centre, Cameroon', latitude: 3.87, longitude: 11.52 });
  assert.equal((await query('SELECT count(*)::int AS n FROM user_locations', []))[0].n, 1);
  assert.equal(second.placeName, 'Yaoundé, Centre, Cameroon');
  assert.equal(second.createdAt, first.createdAt);
  assert.ok(new Date(second.updatedAt) > new Date(first.updatedAt));
});
test('locations are separate per user', async () => {
  const { store } = await freshDatabase();
  await store.upsert('user_a', rounded);
  await store.upsert('user_b', { ...rounded, placeName: 'Bamenda, North-West, Cameroon' });
  assert.equal((await store.get('user_a')).placeName, rounded.placeName);
  assert.equal((await store.get('user_b')).placeName, 'Bamenda, North-West, Cameroon');
  assert.equal(await store.get('user_c'), null);
});
test('hostile text is stored literally because every value is a bound parameter', async () => {
  const { store, query } = await freshDatabase();
  const placeName = "Robert'); DROP TABLE user_locations;--";
  await store.upsert("user_x' OR '1'='1", { ...rounded, placeName });
  assert.equal((await store.get("user_x' OR '1'='1")).placeName, placeName);
  assert.equal(await store.get('user_y'), null);
  assert.equal((await query('SELECT count(*)::int AS n FROM user_locations', []))[0].n, 1);
});
test('the database refuses an exact position even if the application layer were bypassed', async () => {
  const { store } = await freshDatabase();
  const bad = [{ latitude: 4.0511 }, { longitude: 9.76791 }, { latitude: 4.051 }, { latitude: 91 }, { latitude: -91 }, { longitude: 181 },
    { longitude: -181 }, { placeName: 'D' }, { placeName: 'x'.repeat(121) }];
  for (const patch of bad) await assert.rejects(store.upsert('user_a', { ...rounded, ...patch }), undefined, JSON.stringify(patch));
  assert.equal(await store.get('user_a'), null);
});

// ---- HTTP routes ----------------------------------------------------------------------------
const authenticate = async (header) => {
  const match = /^Bearer token-(\w+)$/.exec(header ?? '');
  return match ? { userId: match[1] } : null;
};
function memoryLocationStore() {
  const rows = new Map();
  return {
    rows,
    get: async (userId) => rows.get(userId) ?? null,
    upsert: async (userId, values) => {
      const record = { ...values, createdAt: 'created', updatedAt: 'updated' };
      rows.set(userId, record);
      return record;
    },
  };
}
const unusedProfileStore = { get: async () => null, upsert: async () => { throw new Error('location tests never save a profile'); } };
function setup(locationStore = memoryLocationStore()) {
  return { locationStore, app: createApp({ authenticate, store: unusedProfileStore, locationStore, hasProfilePhoto: async () => assert.fail('the photo is not part of the location') }) };
}
const as = (id, extra = {}) => ({ authorization: `Bearer token-${id}`, ...extra });
const put = (app, id, body, headers = {}) => app.request('/v1/location', {
  method: 'PUT', headers: as(id, { 'content-type': 'application/json', ...headers }), body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('every location route needs a valid session', async () => {
  const { app, locationStore } = setup();
  for (const headers of [{}, { authorization: 'Bearer wrong' }, { authorization: 'Basic abc' }]) {
    assert.equal((await app.request('/v1/location', { headers })).status, 401);
    const write = await app.request('/v1/location', { method: 'PUT', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(VALID) });
    assert.equal(write.status, 401);
  }
  assert.equal(locationStore.rows.size, 0);
});
test('a user without a saved location gets null, which the app treats as "not set"', async () => {
  const { app } = setup();
  const response = await app.request('/v1/location', { headers: as('a') });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { location: null });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('saving stores the rounded location under the verified user and returns it', async () => {
  const { app, locationStore } = setup();
  const response = await put(app, 'a', VALID);
  assert.equal(response.status, 200);
  const { location } = await response.json();
  assert.equal(location.latitude, 4.05);
  assert.equal(location.longitude, 9.77);
  assert.deepEqual(locationStore.rows.get('a').latitude, 4.05);
  assert.deepEqual((await (await app.request('/v1/location', { headers: as('a') })).json()).location, location);
});
test('the user id in the body is ignored: the token decides whose location is written', async () => {
  const { app, locationStore } = setup();
  await put(app, 'a', { ...VALID, userId: 'b', clerk_user_id: 'b', clerkUserId: 'b' });
  assert.deepEqual([...locationStore.rows.keys()], ['a']);
});
test('users can only read their own location', async () => {
  const { app } = setup();
  await put(app, 'a', VALID);
  assert.deepEqual(await (await app.request('/v1/location', { headers: as('b') })).json(), { location: null });
});
test('saving twice updates the same location', async () => {
  const { app, locationStore } = setup();
  await put(app, 'a', VALID);
  await put(app, 'a', { ...VALID, placeName: 'Yaoundé, Centre, Cameroon', latitude: 3.8667, longitude: 11.5167 });
  assert.equal(locationStore.rows.size, 1);
  assert.equal(locationStore.rows.get('a').placeName, 'Yaoundé, Centre, Cameroon');
});
test('invalid input is rejected with field errors and nothing is stored', async () => {
  const { app, locationStore } = setup();
  const response = await put(app, 'a', { placeName: '', latitude: 120, longitude: 'x' });
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.error, 'validation_failed');
  assert.deepEqual(Object.keys(body.fields).sort(), ['latitude', 'longitude', 'placeName']);
  assert.equal(locationStore.rows.size, 0);
});
test('non-JSON content types and broken JSON are refused', async () => {
  const { app, locationStore } = setup();
  assert.equal((await put(app, 'a', JSON.stringify(VALID), { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await put(app, 'a', '{not json')).status, 400);
  assert.equal(locationStore.rows.size, 0);
});
test('oversized bodies are refused before they are read', async () => {
  const { app, locationStore } = setup();
  const response = await put(app, 'a', JSON.stringify({ ...VALID, padding: 'x'.repeat(8 * 1024) }));
  assert.equal(response.status, 413);
  assert.equal(locationStore.rows.size, 0);
});
test('a database failure is a generic server error that leaks nothing', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const { app } = setup({ get: async () => null, upsert: async () => { throw new Error('connection to db.internal:5432 refused, password=hunter2'); } });
    const response = await put(app, 'a', VALID);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'server_error' });
  } finally {
    console.error = original;
  }
});
