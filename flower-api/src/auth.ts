import { createClerkClient, verifyToken } from '@clerk/backend';

/** Resolves the Clerk user for an `Authorization: Bearer <session token>` header, or null. */
export type Authenticator = (authorization: string | undefined) => Promise<{ userId: string } | null>;

type Options = {
  /** Clerk "JWT public key" (PEM). Verifies tokens without calling Clerk's servers. Optional. */
  jwtKey?: string;
};

export function createClerkAuthenticator(secretKey: string, options: Options = {}): Authenticator {
  return async (authorization) => {
    const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(authorization ?? '');
    if (!match) return null;
    try {
      // verifyToken checks the signature, expiry and not-before time, and throws when any fail.
      // It returns the token's claims directly (not a { data, errors } wrapper).
      const claims = await verifyToken(match[1], { secretKey, ...(options.jwtKey ? { jwtKey: options.jwtKey } : {}) });
      const userId = (claims as { sub?: unknown }).sub;
      return typeof userId === 'string' && userId ? { userId } : null;
    } catch {
      return null; // Treat any verification failure as "not signed in"; never echo the reason.
    }
  };
}

/** Whether the Clerk user has a profile photo (their own upload, or one from a social account). */
export type PhotoChecker = (userId: string) => Promise<boolean>;

// The photo lives in Clerk, not in Neon, so the server asks Clerk instead of trusting the app's word.
export function createClerkPhotoChecker(secretKey: string): PhotoChecker {
  const clerk = createClerkClient({ secretKey });
  return async (userId) => (await clerk.users.getUser(userId)).hasImage;
}
