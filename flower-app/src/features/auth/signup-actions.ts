import type { useSSO } from '@clerk/expo';
import type { useSignUp } from '@clerk/expo/legacy';

export type SignupValues = { name: string; email: string; password: string };
export type SocialProvider = 'apple' | 'google' | 'facebook';
export type SignupResult =
  | { kind: 'verification'; email: string }
  | { kind: 'authenticated' }
  | { kind: 'incomplete'; message: string }
  | { kind: 'cancelled' };
export type EmailAttempt = { email: string | null };
type SignupResource = NonNullable<ReturnType<typeof useSignUp>['signUp']>;
type SSOResult = Awaited<ReturnType<ReturnType<typeof useSSO>['startSSOFlow']>>;

export async function sendSignupCode(
  signUp: Pick<SignupResource, 'create' | 'prepareEmailAddressVerification'>,
  values: SignupValues,
  attempt: EmailAttempt,
  onCreated: () => void,
): Promise<SignupResult> {
  if (!attempt.email) {
    const [firstName, ...rest] = values.name.trim().split(/\s+/);
    await signUp.create({
      firstName,
      ...(rest.length ? { lastName: rest.join(' ') } : {}),
      emailAddress: values.email.trim(),
      password: values.password,
    });
    attempt.email = values.email.trim();
    onCreated();
  }
  await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  return { kind: 'verification', email: attempt.email };
}

export async function finishSocialSignup(
  result: SSOResult,
  attempt: EmailAttempt,
  onPending: () => void,
): Promise<SignupResult> {
  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    return { kind: 'authenticated' };
  }
  if (result.authSessionResult?.type === 'cancel' || result.authSessionResult?.type === 'dismiss') {
    return { kind: 'cancelled' };
  }
  if (result.signUp?.unverifiedFields.includes('email_address') && result.signUp.emailAddress) {
    attempt.email = result.signUp.emailAddress;
    onPending();
    await result.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    return { kind: 'verification', email: attempt.email };
  }
  return {
    kind: 'incomplete',
    message: 'Your account needs another step before you can continue. Additional account and sign-in screens are coming soon.',
  };
}
