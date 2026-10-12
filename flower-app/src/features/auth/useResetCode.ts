import { useSignIn } from '@clerk/expo/legacy';

import { getCodeSentAt, recordCodeSent, useCodeSentAt } from '@/store/email-verification';
import { isResetAttemptClosed } from '@/store/password-reset';
import { findResetEmailAddressId, resendResetCode, verifyResetCode } from './password-reset-actions';
import { resendSecondsRemaining } from './verification-utils';

// Feeds the shared six-box VerificationForm with the pending Clerk password reset.
export function useResetCode() {
  const { isLoaded, signIn } = useSignIn();
  const sentAt = useCodeSentAt(signIn?.id);
  // "needs_new_password" stays valid so the screen does not flicker once the code is accepted.
  const hasAttempt = Boolean(isLoaded && signIn?.identifier && !isResetAttemptClosed(signIn.id)
    && (signIn.status === 'needs_first_factor' || signIn.status === 'needs_new_password'));
  const canResend = hasAttempt && Boolean(findResetEmailAddressId(signIn?.supportedFirstFactors ?? null));

  async function verify(code: string) {
    if (!isLoaded || !signIn || !hasAttempt) throw new Error('Start password reset first.');
    return verifyResetCode(signIn, code);
  }

  async function resend() {
    if (!isLoaded || !signIn || !canResend) throw new Error('Start password reset first.');
    await resendResetCode(signIn, resendSecondsRemaining(getCodeSentAt(signIn.id)), () => recordCodeSent(signIn.id));
  }

  // The address comes from the Clerk attempt, never from a URL or route parameter.
  return { verify, resend, email: hasAttempt ? signIn?.identifier ?? undefined : undefined, sentAt,
    ready: isLoaded, hasAttempt, canResend };
}
