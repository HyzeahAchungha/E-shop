import type { useSSO } from '@clerk/expo';
import type { useSignIn } from '@clerk/expo/legacy';

export type SigninValues = { email: string; password: string };
export type SigninResult =
  | { kind: 'authenticated' }
  | { kind: 'cancelled' }
  | { kind: 'incomplete'; message: string };
type SigninResource = NonNullable<ReturnType<typeof useSignIn>['signIn']>;
type SetActive = NonNullable<ReturnType<typeof useSignIn>['setActive']>;
type SSOResult = Awaited<ReturnType<ReturnType<typeof useSSO>['startSSOFlow']>>;

export async function signInWithPassword(
  signIn: Pick<SigninResource, 'create' | 'status' | 'identifier' | 'createdSessionId'>,
  setActive: SetActive,
  values: SigninValues,
): Promise<SigninResult> {
  const identifier = values.email.trim();
  if (!identifier || !values.password) throw new Error('Email and password are required.');
  // A completed attempt can retry failed activation without resubmitting credentials.
  const result = signIn.status === 'complete' && signIn.identifier === identifier
    ? signIn : await signIn.create({ strategy: 'password', identifier, password: values.password });
  if (result.status !== 'complete') {
    return { kind: 'incomplete', message: 'Your account needs an additional verification step. That screen will be added next.' };
  }
  if (!result.createdSessionId) throw new Error('No completed sign-in session was returned.');
  await setActive({ session: result.createdSessionId });
  return { kind: 'authenticated' };
}

export async function finishSocialSignin(result: SSOResult): Promise<SigninResult> {
  if (result.authSessionResult?.type === 'cancel' || result.authSessionResult?.type === 'dismiss') {
    return { kind: 'cancelled' };
  }
  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    return { kind: 'authenticated' };
  }
  return {
    kind: 'incomplete',
    message: 'Your account needs another step before you can sign in. Additional verification and account screens are coming soon.',
  };
}
