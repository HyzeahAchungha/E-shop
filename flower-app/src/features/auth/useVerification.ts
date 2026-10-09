import { useAuth } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';

import { getCodeSentAt, recordCodeSent, useCodeSentAt } from '@/store/email-verification';
import { resendSignupCode, verifySignupCode } from './verification-actions';
import { resendSecondsRemaining } from './verification-utils';

export function useVerification() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const sentAt = useCodeSentAt(signUp?.id);
  const hasAttempt = Boolean(signUp?.emailAddress && signUp.status);
  const canResend = Boolean(signUp?.unverifiedFields.includes('email_address'));

  async function verify(code: string) {
    if (!isLoaded || !signUp || !setActive || !hasAttempt) throw new Error('Start signup first.');
    return verifySignupCode(signUp, setActive, code);
  }

  async function resend() {
    if (!isLoaded || !signUp || !canResend) throw new Error('Start signup first.');
    await resendSignupCode(signUp, resendSecondsRemaining(getCodeSentAt(signUp.id)), () => recordCodeSent(signUp.id));
  }

  return { verify, resend, email: signUp?.emailAddress ?? undefined, sentAt, ready: isLoaded,
    hasAttempt, canResend, isSignedIn: Boolean(isSignedIn) };
}
