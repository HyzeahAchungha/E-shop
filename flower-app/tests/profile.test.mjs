import assert from 'node:assert/strict';
import test from 'node:test';
import { getCountries } from 'libphonenumber-js/min';
import { COUNTRIES, COUNTRY_NAMES, defaultCountryIso, filterCountries, findCountry } from '../src/features/profile/countries.ts';
import { loadProfile, splitName, submitProfile } from '../src/features/profile/profile-actions.ts';
import { validateProfileForm } from '../src/features/profile/profile-validation.ts';
import { ApiError, createApiClient, normalizeBaseUrl } from '../src/lib/api-client.ts';

const BASE = 'https://api.example.test';
const input = { name: 'Jane Doe', countryIso: 'CM', phone: '671234567', gender: 'female' };

// ---- countries ----
test('every supported country has a name and every name belongs to a supported country', () => {
  const codes = new Set(getCountries());
  assert.deepEqual(Object.keys(COUNTRY_NAMES).filter((iso) => !codes.has(iso)), []);
  assert.deepEqual([...codes].filter((iso) => !COUNTRY_NAMES[iso]), []);
  assert.equal(COUNTRIES.length, codes.size);
});
test('the list is sorted by name and carries calling codes, including shared ones', () => {
  const names = COUNTRIES.map((country) => country.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
  assert.equal(findCountry('CM').dial, '237');
  assert.equal(findCountry('US').dial, '1');
  assert.equal(findCountry('CA').dial, '1');
  assert.equal(findCountry('XX'), undefined);
});
test('the starting country follows the device region and falls back to +1 (United States)', () => {
  assert.equal(defaultCountryIso('fr-CM'), 'CM');
  assert.equal(defaultCountryIso('en_GB'), 'GB');
  assert.equal(defaultCountryIso('en-US'), 'US');
  assert.equal(defaultCountryIso('zh-Hans-CN'), 'CN');
  for (const locale of ['en', '', undefined, 'xx-ZZ', 'nonsense']) assert.equal(defaultCountryIso(locale), 'US', String(locale));
});
test('the country search matches name, ISO code and calling code', () => {
  const isos = (query) => filterCountries(query).map((country) => country.iso);
  assert.ok(isos('cam').includes('CM') && isos('cam').includes('KH'));
  assert.deepEqual(isos('237'), ['CM']);
  assert.deepEqual(isos('+237'), ['CM']);
  assert.ok(isos('cm').includes('CM'));
  assert.equal(filterCountries('').length, COUNTRIES.length);
  assert.deepEqual(filterCountries('zzzz'), []);
});

// ---- validation ----
test('a valid form passes and returns trimmed values', () => {
  const result = validateProfileForm({ ...input, name: '  Jane   Doe ' });
  assert.deepEqual(result, { ok: true, value: { name: 'Jane Doe', countryIso: 'CM', phone: '671234567', gender: 'female' } });
});
test('every field is required', () => {
  const result = validateProfileForm({ name: '', countryIso: '', phone: '', gender: null });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['country', 'gender', 'name', 'phone']);
});
test('phone numbers are checked against the chosen country', () => {
  assert.equal(validateProfileForm({ ...input, countryIso: 'US', phone: '(415) 555-2671' }).ok, true);
  assert.equal(validateProfileForm({ ...input, countryIso: 'CI', phone: '07 07 07 07 07' }).ok, true);
  for (const phone of ['123', '67123', 'abcdefghi', '+237671234567', '6'.repeat(500)]) {
    assert.ok(validateProfileForm({ ...input, phone }).errors.phone, phone.slice(0, 12));
  }
  assert.ok(validateProfileForm({ ...input, countryIso: 'CM', phone: '4155552671' }).errors.phone);
});
test('names need a letter and a sensible length; gender must be a listed option', () => {
  for (const name of ['', 'J', '1234', 'a'.repeat(81)]) assert.ok(validateProfileForm({ ...input, name }).errors.name, name.slice(0, 6));
  assert.ok(validateProfileForm({ ...input, gender: 'robot' }).errors.gender);
});

// ---- API client ----
test('base URLs must be https, except plain http in development, and carry no credentials or query', () => {
  assert.equal(normalizeBaseUrl('https://api.example.test/', false), BASE);
  assert.equal(normalizeBaseUrl(' https://api.example.test/v1// ', false), 'https://api.example.test/v1');
  assert.equal(normalizeBaseUrl('http://192.168.1.5:8787', true), 'http://192.168.1.5:8787');
  for (const bad of [undefined, '', '   ', 'http://192.168.1.5:8787', 'ftp://x.test', 'javascript:alert(1)', 'not a url',
    'https://user:pw@api.example.test', 'https://api.example.test?token=1', 'https://api.example.test#x']) {
    assert.equal(normalizeBaseUrl(bad, false), null, String(bad));
  }
});
function fakeFetch(handler) {
  const calls = [];
  const impl = async (url, init) => { calls.push({ url, init }); return handler(url, init); };
  return { impl, calls };
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const client = (handler, extra = {}) => {
  const fetcher = fakeFetch(handler);
  return { fetcher, api: createApiClient({ baseUrl: BASE, getToken: async () => 'tok_synthetic', fetchImpl: fetcher.impl, ...extra }) };
};

test('requests carry the session token, and only PUT bodies are JSON', async () => {
  const { api, fetcher } = client(() => json({ profile: null }));
  await api.request('/v1/profile');
  await api.request('/v1/profile', { method: 'PUT', body: { a: 1 } });
  const [get, put] = fetcher.calls;
  assert.equal(get.url, `${BASE}/v1/profile`);
  assert.equal(get.init.method, 'GET');
  assert.equal(get.init.headers.Authorization, 'Bearer tok_synthetic');
  assert.equal(get.init.headers['Content-Type'], undefined);
  assert.equal(get.init.body, undefined);
  assert.equal(put.init.method, 'PUT');
  assert.equal(put.init.headers['Content-Type'], 'application/json');
  assert.equal(put.init.body, '{"a":1}');
});
test('no address or no session means no request is sent', async () => {
  const fetcher = fakeFetch(() => assert.fail('must not call'));
  const noAddress = createApiClient({ baseUrl: null, getToken: async () => 'tok', fetchImpl: fetcher.impl });
  await assert.rejects(noAddress.request('/v1/profile'), (error) => error instanceof ApiError && error.code === 'not_configured');
  for (const token of [null, '']) {
    const signedOut = createApiClient({ baseUrl: BASE, getToken: async () => token, fetchImpl: fetcher.impl });
    await assert.rejects(signedOut.request('/v1/profile'), (error) => error.code === 'unauthorized');
  }
  assert.equal(fetcher.calls.length, 0);
});
test('server answers map to clear error codes', async () => {
  const expectError = async (response, code, check = () => {}) => {
    const { api } = client(() => response);
    await assert.rejects(api.request('/v1/profile'), (error) => { assert.ok(error instanceof ApiError); assert.equal(error.code, code); check(error); return true; });
  };
  await expectError(json({ error: 'unauthorized' }, 401), 'unauthorized');
  await expectError(json({ error: 'validation_failed', fields: { phone: 'Bad phone', other: 5 } }, 422), 'validation', (error) => {
    assert.deepEqual(error.fields, { phone: 'Bad phone' });
  });
  await expectError(json({ error: 'server_error' }, 500), 'server');
  await expectError(new Response('<html>Bad gateway</html>', { status: 502 }), 'server');
  await expectError(new Response('not json', { status: 200 }), 'bad_response');
  await expectError(json('a string'), 'bad_response');
});
test('network failures and timeouts are reported without leaking details', async () => {
  const offline = client(() => { throw new TypeError('connect ECONNREFUSED 10.0.0.1:8787 secret'); });
  await assert.rejects(offline.api.request('/v1/profile'), (error) => error.code === 'network' && !error.message.includes('secret'));
  const hanging = client((url, init) => new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')))), { timeoutMs: 20 });
  await assert.rejects(hanging.api.request('/v1/profile'), (error) => error.code === 'timeout');
});

// ---- saving ----
const savedProfile = { name: 'Jane Doe', countryIso: 'CM', phoneNational: '671234567', phoneE164: '+237671234567', gender: 'female', createdAt: 'x', updatedAt: 'y' };
function saveDeps({ clerkFails = false, apiFails = false } = {}) {
  const log = [];
  const user = {
    update: async (params) => { log.push(['clerk.update', params]); if (clerkFails) throw new Error('clerk down'); },
    setProfileImage: async (params) => { log.push(['clerk.image', params.file]); },
  };
  const api = { request: async (path, init) => {
    log.push(['api', init?.method ?? 'GET', path, init?.body]);
    if (apiFails) throw new ApiError('network', 'down');
    return { profile: init?.method === 'PUT' ? savedProfile : null };
  } };
  return { deps: { api, user }, log };
}
test('names are split for Clerk the same way signup does it', () => {
  assert.deepEqual(splitName('Jane Doe'), { firstName: 'Jane', lastName: 'Doe' });
  assert.deepEqual(splitName('  Jane   Mary  Doe '), { firstName: 'Jane', lastName: 'Mary Doe' });
  assert.deepEqual(splitName('Madonna'), { firstName: 'Madonna', lastName: '' });
});
test('a missing profile loads as null and a saved one comes back whole', async () => {
  assert.equal(await loadProfile({ request: async () => ({ profile: null }) }), null);
  assert.equal(await loadProfile({ request: async () => ({}) }), null);
  assert.deepEqual(await loadProfile({ request: async () => ({ profile: savedProfile }) }), savedProfile);
});
test('saving updates Clerk first and the API last, sending only the form fields', async () => {
  const { deps, log } = saveDeps();
  const profile = await submitProfile(deps, input, 'data:image/jpeg;base64,AAAA', { clerkKey: null });
  assert.deepEqual(profile, savedProfile);
  assert.deepEqual(log.map((entry) => entry[0]), ['clerk.update', 'clerk.image', 'api']);
  assert.deepEqual(log[0][1], { firstName: 'Jane', lastName: 'Doe' });
  assert.deepEqual(log[2], ['api', 'PUT', '/v1/profile', { name: 'Jane Doe', countryIso: 'CM', phone: '671234567', gender: 'female' }]);
});
test('without a picked photo nothing is uploaded, so an existing Clerk photo is kept', async () => {
  const { deps, log } = saveDeps();
  await submitProfile(deps, input, null, { clerkKey: null });
  assert.deepEqual(log.map((entry) => entry[0]), ['clerk.update', 'api']);
});
test('if Clerk fails nothing is written to the API, so the profile never counts as complete', async () => {
  const { deps, log } = saveDeps({ clerkFails: true });
  const state = { clerkKey: null };
  await assert.rejects(submitProfile(deps, input, null, state), /clerk down/);
  assert.deepEqual(log.map((entry) => entry[0]), ['clerk.update']);
  assert.equal(state.clerkKey, null);
});
test('if the API fails, retrying does not repeat the Clerk update or the photo upload', async () => {
  const failing = saveDeps({ apiFails: true });
  const state = { clerkKey: null };
  await assert.rejects(submitProfile(failing.deps, input, 'data:image/jpeg;base64,AAAA', state));
  const retry = saveDeps();
  await submitProfile(retry.deps, input, 'data:image/jpeg;base64,AAAA', state);
  assert.deepEqual(retry.log.map((entry) => entry[0]), ['api']);
});
test('changing the name or photo after a failure updates Clerk again', async () => {
  const state = { clerkKey: null };
  await assert.rejects(submitProfile(saveDeps({ apiFails: true }).deps, input, null, state));
  const renamed = saveDeps();
  await submitProfile(renamed.deps, { ...input, name: 'Jane Smith' }, null, state);
  assert.deepEqual(renamed.log.map((entry) => entry[0]), ['clerk.update', 'api']);
  const newPhoto = saveDeps();
  await submitProfile(newPhoto.deps, { ...input, name: 'Jane Smith' }, 'data:image/jpeg;base64,BBBB', state);
  assert.deepEqual(newPhoto.log.map((entry) => entry[0]), ['clerk.update', 'clerk.image', 'api']);
});
test('a response without the saved profile is an error, never a silent success', async () => {
  const { deps } = saveDeps();
  deps.api.request = async () => ({ profile: null });
  await assert.rejects(submitProfile(deps, input, null, { clerkKey: null }));
});
