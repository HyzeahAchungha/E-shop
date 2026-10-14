import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { validateProfile } from '../src/profile-validation.ts';

// The app validates for instant feedback; this server validates for real. They must agree, or users
// would be told "fine" by the app and then rejected by the server (or the reverse).
const appRoot = join(import.meta.dirname, '..', '..', 'flower-app');
let app = null;
try {
  await access(join(appRoot, 'node_modules', 'libphonenumber-js'));
  app = await import(join(appRoot, 'src', 'features', 'profile', 'profile-validation.ts'));
} catch {
  app = null; // flower-app dependencies are not installed here, so there is nothing to compare.
}

const names = ['Jane Doe', '  Jane   Doe ', 'J', '', '1234', 'Zoë Ngô', '李小龍', 'a'.repeat(80), 'a'.repeat(81)];
const phones = [['CM', '671234567'], ['CM', '6 71 23 45 67'], ['CM', '237671234567'], ['CM', '+237671234567'], ['CM', '4155552671'], ['CM', '12'],
  ['CM', ''], ['CM', 'abc'], ['US', '(415) 555-2671'], ['US', '415555267'], ['GB', '07911 123456'], ['GB', '7911123456'], ['CI', '07 07 07 07 07'],
  ['CI', '7 07 07 07 07'], ['NG', '0803 123 4567'], ['FR', '06 12 34 56 78'], ['IN', '98765 43210'], ['ZZ', '671234567'], ['', '671234567'],
  ['cm', '671234567'], ['CM', '6'.repeat(40)]];
const genders = ['male', 'female', 'other', 'prefer_not_to_say', '', 'Male', 'x'];

test('the app and the server accept and reject exactly the same profiles', { skip: app ? false : 'flower-app dependencies are not installed' }, () => {
  const cases = [];
  for (const name of names) cases.push({ name, countryIso: 'CM', phone: '671234567', gender: 'female' });
  for (const [countryIso, phone] of phones) cases.push({ name: 'Jane Doe', countryIso, phone, gender: 'female' });
  for (const gender of genders) cases.push({ name: 'Jane Doe', countryIso: 'CM', phone: '671234567', gender: gender || null });

  for (const values of cases) {
    const server = validateProfile({ ...values, gender: values.gender ?? undefined });
    const client = app.validateProfileForm(values);
    const label = JSON.stringify(values).slice(0, 90);
    assert.equal(client.ok, server.ok, `ok differs for ${label}`);
    if (server.ok) {
      assert.equal(client.value.name, server.value.name, label);
      assert.equal(client.value.countryIso, server.value.countryIso, label);
      assert.equal(client.value.gender, server.value.gender, label);
    } else {
      assert.deepEqual(Object.keys(client.errors).sort(), Object.keys(server.errors).sort(), `error fields differ for ${label}`);
      for (const field of Object.keys(server.errors)) assert.equal(client.errors[field], server.errors[field], `${field} message differs for ${label}`);
    }
  }
  assert.ok(cases.length > 35);
});

test('both sides use the same phone library version', { skip: app ? false : 'flower-app dependencies are not installed' }, async () => {
  const { readFile } = await import('node:fs/promises');
  const version = async (root) => JSON.parse(await readFile(join(root, 'node_modules', 'libphonenumber-js', 'package.json'), 'utf8')).version;
  assert.equal(await version(appRoot), await version(join(appRoot, '..', 'flower-api')));
});
