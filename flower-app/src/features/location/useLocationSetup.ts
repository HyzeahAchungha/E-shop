import { useAuth } from '@clerk/expo';
import { useEffect, useEffectEvent, useState } from 'react';

import { apiBaseUrl, createApiClient } from '@/lib/api-client';
import type { LocationInput, SavedLocation } from '@/types/location';
import { deviceLocation } from './device-location';
import { loadLocation, resolveDeviceLocation, saveLocation, type DeviceLocationResult } from './location-actions';

export type LocationSetupStatus = 'loading' | 'signed-out' | 'saved' | 'load-error' | 'form';

type Loaded = { attempt: number; result: 'saved' | 'needs-location' | 'error' };

// Decides what the Location route shows: it asks the API whether this user already has a location
// (new users see the choice once; users who set one are not asked again) and saves the one found.
export function useLocationSetup() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const ready = isLoaded && Boolean(isSignedIn) && Boolean(apiBaseUrl);

  // The client is built only when a request is made, with whichever token function Clerk has right now.
  const makeApi = () => createApiClient({ baseUrl: apiBaseUrl, getToken: () => getToken() });
  const fetchLocation = useEffectEvent(() => loadLocation(makeApi()));

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetchLocation().then(
      (location) => { if (!cancelled) setLoaded({ attempt, result: location ? 'saved' : 'needs-location' }); },
      () => { if (!cancelled) setLoaded({ attempt, result: 'error' }); },
    );
    return () => { cancelled = true; };
  }, [attempt, ready]);

  let status: LocationSetupStatus;
  if (!isLoaded) status = 'loading';
  else if (!isSignedIn) status = 'signed-out';
  // Without a server address the screen stays reviewable and explains why it cannot save.
  else if (!apiBaseUrl) status = 'form';
  else if (loaded?.attempt !== attempt) status = 'loading';
  else if (loaded.result === 'saved') status = 'saved';
  else if (loaded.result === 'error') status = 'load-error';
  else status = 'form';

  async function save(location: LocationInput): Promise<SavedLocation> {
    return saveLocation(makeApi(), location);
  }

  return { status, save: apiBaseUrl ? save : undefined, retry: () => setAttempt((count) => count + 1) };
}

/** Asks for permission and finds the user's approximate location with the phone's own features. */
export function findDeviceLocation(): Promise<DeviceLocationResult> {
  return resolveDeviceLocation(deviceLocation);
}
