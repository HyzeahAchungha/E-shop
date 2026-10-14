import { ApiError } from '@/lib/api-client';
import { authErrorMessage } from '@/features/auth/auth-errors';

/** Plain-language message for anything that can go wrong while saving the profile. */
export function profileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'not_configured':
        return 'Saving your profile is not available yet: the app has no server address. Set EXPO_PUBLIC_API_URL and restart.';
      case 'unauthorized':
        return 'Your session has expired. Please sign in again.';
      case 'network':
        return 'We could not reach the server. Check your connection and try again.';
      case 'timeout':
        return 'The server took too long to respond. Please try again.';
      case 'validation':
        return 'Please check the highlighted fields.';
      default:
        return 'Something went wrong on our side. Please try again in a moment.';
    }
  }
  // Clerk errors (name or photo update) carry their own readable message; anything else gets a generic one.
  return authErrorMessage(error);
}
