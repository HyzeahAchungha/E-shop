import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { roundCoordinate as serverRound } from '../src/location-validation.ts';

// The app rounds before anything leaves the phone; the server rounds again and never trusts the app.
// If the two ever disagreed, a saved location would not match what the user was shown.
const appFile = join(import.meta.dirname, '..', '..', 'flower-app', 'src', 'features', 'location', 'location-actions.ts');
let app = null;
try {
  await access(appFile);
  app = await import(appFile);
} catch {
  app = null; // The app is not next to the API here, so there is nothing to compare.
}

const samples = [0, -0, 4.0511, 9.7679, -33.8688197, 151.2092955, 0.005, -0.005, 0.004, -0.004, 1.005, 1.015, 2.675, -1.005, 179.995, -179.995, 90, -90, 180, -180,
  89.999, 12.345, 12.355, 48.8566, 2.3522, 1e-7, -1e-7, 45.123456789];

test('the app and the server round coordinates to exactly the same value', { skip: app ? false : 'flower-app is not available' }, () => {
  assert.equal(app.COORDINATE_DECIMALS, 2);
  for (const value of samples) assert.ok(Object.is(app.roundCoordinate(value), serverRound(value)), String(value));
});
