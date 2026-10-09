import type { useSignUp } from '@clerk/expo/legacy';

type SignupResource = NonNullable<ReturnType<typeof useSignUp>['signUp']>;
type SetActive = NonNullable<ReturnType<typeof useSignUp>['setActive']>;
export type VerificationResult = { kind: 'authenticated' } | { kind: 'incomplete'; message: string };

export async function verifySignupCode(
  signUp: Pick<SignupResource, 'status' | 'createdSessionId' | 'attemptEmailAddressVerification'>,
  setActive: SetActive,
  code: string,
): Promise<VerificationResult> {
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the complete six-digit code.');
  // If activation failed after successful verification, retry activation alone.
  const result = signUp.status === 'complete' ? signUp : await signUp.attemptEmailAddressVerification({ code });
  if (result.status !== 'complete') {
    return { kind: 'incomplete', message: 'Your account needs another step before signup can finish. We’ll add that screen next.' };
  }
  if (!result.createdSessionId) throw new Error('No completed session was returned.');
  await setActive({ session: result.createdSessionId });
  return { kind: 'authenticated' };
}

export async function resendSignupCode(
  signUp: Pick<SignupResource, 'emailAddress' | 'unverifiedFields' | 'prepareEmailAddressVerification'>,
  secondsRemaining: number,
  onSent: () => void,
): Promise<void> {
  if (!signUp.emailAddress || !signUp.unverifiedFields.includes('email_address')) throw new Error('No pending email verification.');
  if (secondsRemaining > 0) throw new Error('Please wait before resending.');
  await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  onSent();
}
