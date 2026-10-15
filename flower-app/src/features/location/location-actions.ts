import type { ApiClient } from '../../lib/api-client';
import type { LocationInput, SavedLocation } from '../../types/location';

// Two decimals of a degree is about 1.1 km: enough to find nearby florists, too coarse to find a home.
// flower-api rounds again and the database refuses anything finer; flower-api/tests/location-parity.test.mjs
// fails if the two roundings ever differ.
export const COORDINATE_DECIMALS = 2;
const PLACE_NAME_MAX = 120;

export function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_DECIMALS;
  // "|| 0" turns -0 into 0 so tiny negative values do not become "-0".
  return Math.round(value * factor) / factor || 0;
}

/** The parts of a reverse-geocoded address that the place name uses. */
export type GeocodedAddress = {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
  country?: string | null;
};

/**
 * "Douala, Littoral, Cameroon": the locality, then the region and country, without repeats and without
 * street details. If the system cannot name the place, the rounded coordinates stand in for the name.
 */
export function formatPlaceName(addresses: readonly GeocodedAddress[], latitude: number, longitude: number): string {
  const address = addresses[0];
  const clean = (value?: string | null) => (value ?? '').trim().replace(/\s+/g, ' ');
  const parts: string[] = [];
  for (const part of [clean(address?.city) || clean(address?.district) || clean(address?.subregion), clean(address?.region), clean(address?.country)]) {
    if (part && parts[parts.length - 1]?.toLowerCase() !== part.toLowerCase()) parts.push(part);
  }
  const name = parts.join(', ') || `${latitude.toFixed(COORDINATE_DECIMALS)}, ${longitude.toFixed(COORDINATE_DECIMALS)}`;
  return name.length > PLACE_NAME_MAX ? `${name.slice(0, PLACE_NAME_MAX - 1).trimEnd()}…` : name;
}

/** The device features the flow needs, so tests can pass stand-ins. */
export type DeviceLocationDeps = {
  hasServicesEnabled: () => Promise<boolean>;
  requestPermission: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
  getPosition: () => Promise<{ latitude: number; longitude: number }>;
  reverseGeocode: (position: { latitude: number; longitude: number }) => Promise<readonly GeocodedAddress[]>;
};

export type DeviceLocationResult =
  | { kind: 'found'; location: LocationInput }
  | { kind: 'denied'; canAskAgain: boolean }
  | { kind: 'services-off' }
  | { kind: 'unavailable' };

/**
 * Asks for permission (only while the app is open), reads the position, rounds it, and names the place.
 * Rounding happens before the name lookup, so an exact position never leaves this function: not to the
 * system's address service, not to the server.
 */
export async function resolveDeviceLocation(deps: DeviceLocationDeps): Promise<DeviceLocationResult> {
  let permission: Awaited<ReturnType<DeviceLocationDeps['requestPermission']>>;
  try {
    permission = await deps.requestPermission();
  } catch {
    return { kind: 'unavailable' };
  }
  if (!permission.granted) return { kind: 'denied', canAskAgain: permission.canAskAgain };

  try {
    if (!(await deps.hasServicesEnabled())) return { kind: 'services-off' };
  } catch {
    return { kind: 'unavailable' };
  }

  let position: { latitude: number; longitude: number };
  try {
    position = await deps.getPosition();
  } catch {
    return { kind: 'unavailable' };
  }
  if (!Number.isFinite(position.latitude) || !Number.isFinite(position.longitude)
    || Math.abs(position.latitude) > 90 || Math.abs(position.longitude) > 180) {
    return { kind: 'unavailable' };
  }

  const latitude = roundCoordinate(position.latitude);
  const longitude = roundCoordinate(position.longitude);
  let addresses: readonly GeocodedAddress[] = [];
  try {
    addresses = await deps.reverseGeocode({ latitude, longitude });
  } catch {
    addresses = []; // A missing place name must not block the user: the coordinates stand in for it.
  }
  return { kind: 'found', location: { placeName: formatPlaceName(addresses, latitude, longitude), latitude, longitude } };
}

type LocationResponse = { location: SavedLocation | null };

/** The signed-in user's saved location, or null when they have not set one yet. */
export async function loadLocation(api: Pick<ApiClient, 'request'>): Promise<SavedLocation | null> {
  const response = await api.request<LocationResponse>('/v1/location');
  return response.location ?? null;
}

export async function saveLocation(api: Pick<ApiClient, 'request'>, location: LocationInput): Promise<SavedLocation> {
  const response = await api.request<LocationResponse>('/v1/location', {
    method: 'PUT',
    // Only these three fields are sent, and the coordinates are rounded again here as a safeguard.
    body: { placeName: location.placeName, latitude: roundCoordinate(location.latitude), longitude: roundCoordinate(location.longitude) },
  });
  if (!response.location) throw new Error('The server did not return the saved location.');
  return response.location;
}
