import type { ApiClient } from '../../lib/api-client';
import type { Profile, ProfileInput } from '../../types/profile';

// Minimal shape of Clerk's user resource, so tests can pass a stand-in.
export type ClerkUserLike = {
  update: (params: { firstName?: string; lastName?: string }) => Promise<unknown>;
  setProfileImage: (params: { file: string }) => Promise<unknown>;
};

/** Remembers which name/photo Clerk already has, so a retry after a failed save does not repeat the upload. */
export type SyncState = { clerkKey: string | null };

type ProfileResponse = { profile: Profile | null };

/** The signed-in user's saved profile, or null when they have not completed one yet. */
export async function loadProfile(api: Pick<ApiClient, 'request'>): Promise<Profile | null> {
  const response = await api.request<ProfileResponse>('/v1/profile');
  return response.profile ?? null;
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

/**
 * Saves the profile. Clerk is updated first and the API (Neon) last, so a profile only counts as
 * complete once everything succeeded. Every step is safe to repeat, so "try again" is always fine.
 * `avatarDataUri` is only uploaded when the user picked one: an existing Clerk photo is never removed.
 */
export async function submitProfile(
  deps: { api: Pick<ApiClient, 'request'>; user: ClerkUserLike },
  input: ProfileInput,
  avatarDataUri: string | null,
  state: SyncState,
): Promise<Profile> {
  const key = JSON.stringify([input.name, avatarDataUri]);
  if (state.clerkKey !== key) {
    const { firstName, lastName } = splitName(input.name);
    await deps.user.update({ firstName, lastName });
    if (avatarDataUri) await deps.user.setProfileImage({ file: avatarDataUri });
    state.clerkKey = key;
  }
  const response = await deps.api.request<ProfileResponse>('/v1/profile', {
    method: 'PUT',
    body: { name: input.name, countryIso: input.countryIso, phone: input.phone, gender: input.gender },
  });
  if (!response.profile) throw new Error('The server did not return the saved profile.');
  return response.profile;
}
