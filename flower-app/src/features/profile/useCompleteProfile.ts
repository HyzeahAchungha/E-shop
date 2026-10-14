import { useAuth, useUser } from '@clerk/expo';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { ApiError, apiBaseUrl, createApiClient } from '@/lib/api-client';
import type { Profile, ProfileInput } from '@/types/profile';
import { loadProfile, submitProfile, type SyncState } from './profile-actions';

export type CompleteProfileStatus = 'loading' | 'signed-out' | 'complete' | 'load-error' | 'form';

type Loaded = { attempt: number; result: 'complete' | 'needs-profile' | 'error' };

// Decides what the Complete Profile route shows: it asks the API whether this Clerk user already has a
// profile (new users see the form once; returning users skip it) and saves the form when submitted.
export function useCompleteProfile() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const sync = useRef<SyncState>({ clerkKey: null });
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const ready = isLoaded && userLoaded && Boolean(isSignedIn) && Boolean(apiBaseUrl);

  // The client is built only when a request is made, with whichever token function Clerk has right now.
  const makeApi = () => createApiClient({ baseUrl: apiBaseUrl, getToken: () => getToken() });
  const fetchProfile = useEffectEvent(() => loadProfile(makeApi()));

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetchProfile().then(
      (profile) => { if (!cancelled) setLoaded({ attempt, result: profile ? 'complete' : 'needs-profile' }); },
      () => { if (!cancelled) setLoaded({ attempt, result: 'error' }); },
    );
    return () => { cancelled = true; };
  }, [attempt, ready]);

  let status: CompleteProfileStatus;
  if (!isLoaded || !userLoaded) status = 'loading';
  else if (!isSignedIn) status = 'signed-out';
  // Without a server address the form stays reviewable and explains why it cannot save.
  else if (!apiBaseUrl) status = 'form';
  else if (loaded?.attempt !== attempt) status = 'loading';
  else if (loaded.result === 'complete') status = 'complete';
  else if (loaded.result === 'error') status = 'load-error';
  else status = 'form';

  async function submit(input: ProfileInput, avatarDataUri: string | null): Promise<Profile> {
    // Check first, so Clerk is not changed when the profile cannot be saved afterwards.
    if (!apiBaseUrl) throw new ApiError('not_configured', 'The profile service address is not set.');
    if (!user) throw new ApiError('unauthorized', 'You are not signed in.', 401);
    return submitProfile({ api: makeApi(), user }, input, avatarDataUri, sync.current);
  }

  return {
    status,
    initialName: user?.fullName ?? '',
    // A photo the user already has in Clerk (for example from a social account) counts as their profile photo.
    initialPhotoUri: user?.hasImage ? user.imageUrl : null,
    submit,
    retry: () => setAttempt((count) => count + 1),
  };
}
