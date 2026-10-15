import assert from 'node:assert/strict';
import test from 'node:test';
import { formatPlaceName, loadLocation, resolveDeviceLocation, roundCoordinate, saveLocation } from '../src/features/location/location-actions.ts';

const granted = async () => ({ granted: true, canAskAgain: true });
const deviceAt = (latitude, longitude, overrides = {}) => ({
  hasServicesEnabled: async () => true,
  requestPermission: granted,
  getPosition: async () => ({ latitude, longitude }),
  reverseGeocode: async () => [{ city: 'Douala', region: 'Littoral', country: 'Cameroon' }],
  ...overrides,
});

test('coordinates are rounded to two decimals, and negative zero never appears', () => {
  assert.equal(roundCoordinate(4.0511), 4.05);
  assert.equal(roundCoordinate(9.7679), 9.77);
  assert.equal(roundCoordinate(-33.8688197), -33.87);
  assert.ok(Object.is(roundCoordinate(-0.004), 0));
  assert.equal(roundCoordinate(90), 90);
  assert.equal(roundCoordinate(-180), -180);
});

test('the place name is locality, region and country without repeats', () => {
  assert.equal(formatPlaceName([{ city: 'Douala', region: 'Littoral', country: 'Cameroon' }], 4.05, 9.77), 'Douala, Littoral, Cameroon');
  assert.equal(formatPlaceName([{ city: 'Singapore', region: 'Singapore', country: 'Singapore' }], 1.35, 103.82), 'Singapore');
  assert.equal(formatPlaceName([{ city: ' Paris ', region: 'ÎLE-DE-FRANCE', country: 'France' }], 48.86, 2.35), 'Paris, ÎLE-DE-FRANCE, France');
});
test('the place name falls back from city to district to subregion', () => {
  assert.equal(formatPlaceName([{ city: null, district: 'Akwa', subregion: 'Wouri', region: 'Littoral', country: 'Cameroon' }], 4.05, 9.7), 'Akwa, Littoral, Cameroon');
  assert.equal(formatPlaceName([{ city: '', district: null, subregion: 'Wouri', region: null, country: 'Cameroon' }], 4.05, 9.7), 'Wouri, Cameroon');
});
test('street and postal details never enter the place name', () => {
  const name = formatPlaceName([{ city: 'Douala', region: 'Littoral', country: 'Cameroon', street: 'Rue Joss', streetNumber: '12', postalCode: 'BP 1', name: 'My house' }], 4.05, 9.7);
  assert.equal(name, 'Douala, Littoral, Cameroon');
});
test('without a usable address the rounded coordinates stand in for the name', () => {
  assert.equal(formatPlaceName([], 4.05, 9.77), '4.05, 9.77');
  assert.equal(formatPlaceName([{ city: null, region: null, country: null }], -33.87, 151.21), '-33.87, 151.21');
  assert.equal(formatPlaceName([{ city: '   ' }], 0, 0), '0.00, 0.00');
});
test('very long names are cut to the 120 characters the server accepts', () => {
  const name = formatPlaceName([{ city: 'A'.repeat(200), region: 'B', country: 'C' }], 1, 1);
  assert.ok(name.length <= 120);
  assert.ok(name.endsWith('…'));
});

test('a granted permission returns the rounded location with its place name', async () => {
  const result = await resolveDeviceLocation(deviceAt(4.0511, 9.7679));
  assert.deepEqual(result, { kind: 'found', location: { placeName: 'Douala, Littoral, Cameroon', latitude: 4.05, longitude: 9.77 } });
});
test('the exact position never leaves the flow: the place lookup only sees the rounded point', async () => {
  const seen = [];
  const result = await resolveDeviceLocation(deviceAt(4.051123456, 9.767987654, { reverseGeocode: async (position) => { seen.push(position); return []; } }));
  assert.deepEqual(seen, [{ latitude: 4.05, longitude: 9.77 }]);
  assert.equal(result.location.latitude, 4.05);
  assert.equal(JSON.stringify(result).includes('4.0511'), false);
  assert.equal(JSON.stringify(result).includes('9.7679'), false);
});
test('a denied permission stops everything and says whether it can be asked again', async () => {
  for (const canAskAgain of [true, false]) {
    const result = await resolveDeviceLocation(deviceAt(4, 9, {
      requestPermission: async () => ({ granted: false, canAskAgain }),
      hasServicesEnabled: async () => assert.fail('must not check services'),
      getPosition: async () => assert.fail('must not read the position'),
      reverseGeocode: async () => assert.fail('must not look up a place'),
    }));
    assert.deepEqual(result, { kind: 'denied', canAskAgain });
  }
});
test('location services switched off is reported on its own', async () => {
  const result = await resolveDeviceLocation(deviceAt(4, 9, { hasServicesEnabled: async () => false, getPosition: async () => assert.fail('must not read the position') }));
  assert.deepEqual(result, { kind: 'services-off' });
});
test('failures while asking, checking or reading are "unavailable", never a crash', async () => {
  const boom = async () => { throw new Error('synthetic failure'); };
  assert.deepEqual(await resolveDeviceLocation(deviceAt(4, 9, { requestPermission: boom })), { kind: 'unavailable' });
  assert.deepEqual(await resolveDeviceLocation(deviceAt(4, 9, { hasServicesEnabled: boom })), { kind: 'unavailable' });
  assert.deepEqual(await resolveDeviceLocation(deviceAt(4, 9, { getPosition: boom })), { kind: 'unavailable' });
});
test('impossible positions are treated as unavailable', async () => {
  for (const [latitude, longitude] of [[NaN, 9], [4, Infinity], [91, 9], [4, 181], [-91, 0], [0, -181]]) {
    assert.deepEqual(await resolveDeviceLocation(deviceAt(latitude, longitude)), { kind: 'unavailable' }, `${latitude},${longitude}`);
  }
});
test('a failing place lookup does not block the user: the coordinates become the name', async () => {
  const result = await resolveDeviceLocation(deviceAt(4.0511, 9.7679, { reverseGeocode: async () => { throw new Error('geocoder offline'); } }));
  assert.deepEqual(result, { kind: 'found', location: { placeName: '4.05, 9.77', latitude: 4.05, longitude: 9.77 } });
});

test('loading returns the saved location, or null when none exists', async () => {
  const saved = { placeName: 'Douala', latitude: 4.05, longitude: 9.77, createdAt: 'a', updatedAt: 'b' };
  assert.deepEqual(await loadLocation({ request: async (path) => { assert.equal(path, '/v1/location'); return { location: saved }; } }), saved);
  assert.equal(await loadLocation({ request: async () => ({ location: null }) }), null);
  assert.equal(await loadLocation({ request: async () => ({}) }), null);
  await assert.rejects(loadLocation({ request: async () => { throw new Error('synthetic network failure'); } }));
});
test('saving sends only the three fields and rounds them again as a safeguard', async () => {
  const calls = [];
  const saved = await saveLocation({ request: async (path, init) => { calls.push([path, init]); return { location: { placeName: 'Douala', latitude: 4.05, longitude: 9.77, createdAt: 'a', updatedAt: 'b' } }; } },
    { placeName: 'Douala', latitude: 4.0511, longitude: 9.7679, userId: 'someone-else' });
  assert.deepEqual(calls, [['/v1/location', { method: 'PUT', body: { placeName: 'Douala', latitude: 4.05, longitude: 9.77 } }]]);
  assert.equal(saved.latitude, 4.05);
});
test('a save without a returned location, or a rejected save, is an error', async () => {
  const input = { placeName: 'Douala', latitude: 4.05, longitude: 9.77 };
  await assert.rejects(saveLocation({ request: async () => ({ location: null }) }, input));
  await assert.rejects(saveLocation({ request: async () => { throw new Error('synthetic validation failure'); } }, input));
});
