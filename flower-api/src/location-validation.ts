// Server-side rules for the saved location. The app has its own copy of the rounding
// (flower-app/src/features/location/location-actions.ts) so precise coordinates never even leave the
// phone; the server rounds again and never trusts it. tests/location-parity.test.mjs keeps both equal.

export const PLACE_NAME_MIN = 2;
export const PLACE_NAME_MAX = 120;
/** Two decimals of a degree is about 1.1 km: enough to find nearby florists, too coarse to find a home. */
export const COORDINATE_DECIMALS = 2;

export type LocationValues = { placeName: string; latitude: number; longitude: number };
export type LocationErrors = Partial<Record<'placeName' | 'latitude' | 'longitude', string>>;
export type LocationValidation = { ok: true; value: LocationValues } | { ok: false; errors: LocationErrors };

export function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_DECIMALS;
  // "|| 0" turns -0 into 0 so tiny negative values do not become "-0".
  return Math.round(value * factor) / factor || 0;
}

export function normalizePlaceName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateLocation(input: unknown): LocationValidation {
  const errors: LocationErrors = {};
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  const placeName = typeof body.placeName === 'string' ? normalizePlaceName(body.placeName) : '';
  // Control characters (such as a null byte) are never part of a place name, and PostgreSQL rejects some of them.
  if (placeName.length < PLACE_NAME_MIN || !/[\p{L}\p{N}]/u.test(placeName) || /\p{Cc}/u.test(placeName)) errors.placeName = 'Enter the name of your place.';
  else if (placeName.length > PLACE_NAME_MAX) errors.placeName = `The place name must be ${PLACE_NAME_MAX} characters or fewer.`;

  const { latitude, longitude } = body;
  // Only real numbers: a string like "4.05" or a value like NaN is a malformed request, not a location.
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.latitude = 'The latitude is not valid.';
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.longitude = 'The longitude is not valid.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { placeName, latitude: roundCoordinate(latitude as number), longitude: roundCoordinate(longitude as number) } };
}
