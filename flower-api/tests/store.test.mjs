import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { createSqlProfileStore } from '../src/profile-store.ts';

// PGlite is a real Postgres engine running in-process. It runs the actual migration file and
// the actual store SQL, so the schema and queries are checked without needing Neon.
const migrations = join(import.meta.dirname, '..', 'migrations');
async function freshDatabase() {
  const db = new PGlite();
  for (const file of (await readdir(migrations)).filter((name) => name.endsWith('.sql')).sort()) {
    await db.query(await readFile(join(migrations, file), 'utf8'));
  }
  const query = async (text, params) => (await db.query(text, params)).rows;
  return { db, query, store: createSqlProfileStore(query) };
}
const values = { name: 'Jane Doe', countryIso: 'CM', phoneNational: '671234567', phoneE164: '+237671234567', gender: 'female' };

test('migration files each hold a single statement and can be run twice', async () => {
  const { db } = await freshDatabase();
  for (const file of (await readdir(migrations)).filter((name) => name.endsWith('.sql'))) {
    const sql = (await readFile(join(migrations, file), 'utf8')).replace(/--.*$/gm, '').trim();
    assert.equal(sql.split(';').filter((part) => part.trim()).length, 1, `${file} must be one statement for Neon's HTTP driver`);
    await db.query(sql);
  }
});
test('a missing profile is null', async () => {
  const { store } = await freshDatabase();
  assert.equal(await store.get('user_a'), null);
});
test('upsert creates a profile and get reads it back with ISO timestamps', async () => {
  const { store } = await freshDatabase();
  const saved = await store.upsert('user_a', values);
  assert.equal(saved.name, 'Jane Doe');
  assert.equal(saved.phoneE164, '+237671234567');
  assert.match(saved.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(await store.get('user_a'), saved);
});
test('upsert updates the same row, keeping created_at and moving updated_at', async () => {
  const { store, query } = await freshDatabase();
  const first = await store.upsert('user_a', values);
  await new Promise((resolve) => setTimeout(resolve, 15));
  const second = await store.upsert('user_a', { ...values, name: 'Jane Smith', gender: 'other' });
  assert.equal((await query('SELECT count(*)::int AS n FROM profiles', []))[0].n, 1);
  assert.equal(second.name, 'Jane Smith');
  assert.equal(second.gender, 'other');
  assert.equal(second.createdAt, first.createdAt);
  assert.ok(new Date(second.updatedAt) > new Date(first.updatedAt));
});
test('profiles are separate per user', async () => {
  const { store } = await freshDatabase();
  await store.upsert('user_a', values);
  await store.upsert('user_b', { ...values, name: 'Bob Roe' });
  assert.equal((await store.get('user_a')).name, 'Jane Doe');
  assert.equal((await store.get('user_b')).name, 'Bob Roe');
  assert.equal(await store.get('user_c'), null);
});
test('hostile text is stored literally because every value is a bound parameter', async () => {
  const { store, query } = await freshDatabase();
  const name = "Robert'); DROP TABLE profiles;--";
  await store.upsert("user_x' OR '1'='1", { ...values, name });
  assert.equal((await store.get("user_x' OR '1'='1")).name, name);
  assert.equal(await store.get('user_y'), null);
  assert.equal((await query('SELECT count(*)::int AS n FROM profiles', []))[0].n, 1);
});
test('the database itself rejects invalid rows, as a last line of defence', async () => {
  const { store } = await freshDatabase();
  const bad = [{ name: 'J' }, { name: 'x'.repeat(81) }, { countryIso: 'cm' }, { countryIso: 'CMR' }, { phoneNational: '12' },
    { phoneNational: '12ab45' }, { phoneE164: '237671234567' }, { phoneE164: '+0671234567' }, { gender: 'unknown' }];
  for (const patch of bad) await assert.rejects(store.upsert('user_a', { ...values, ...patch }), undefined, JSON.stringify(patch));
  assert.equal(await store.get('user_a'), null);
});
