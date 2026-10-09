import { isClerkAPIResponseError } from '@clerk/expo';

export function authErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage || error.errors[0]?.message || 'Unable to continue. Please try again.';
  }
  return 'Unable to continue right now. Please check your connection and try again.';
}
