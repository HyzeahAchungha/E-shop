import { useAuth, useSSO } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';
import { makeRedirectUri } from 'expo-auth-session';
import { useRef, useState } from 'react';
import { Platform } from 'react-native';

import { getCodeSentAt, recordCodeSent, useCodeSentAt } from '@/store/email-verification';

import { finishSocialSignup, sendSignupCode, type EmailAttempt, type SignupResult, type SignupValues, type SocialProvider } from './signup-actions';

export type { SignupResult, SignupValues, SocialProvider } from './signup-actions';

export { authErrorMessage as signupErrorMessage } from './auth-errors';

export function useSignup() {
  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();
  const [awaitingCode, setAwaitingCode] = useState(false);
  const sentAt = useCodeSentAt(signUp?.id);
  // Retry code delivery without creating another account after a send failure.
  const pendingAttempt = useRef<EmailAttempt>({ email: null });

  async function register(values: SignupValues): Promise<SignupResult> {
    if (!isLoaded || !signUp) throw new Error('Authentication is loading.');
    if (!pendingAttempt.current.email && getCodeSentAt(signUp.id)) {
      pendingAttempt.current.email = signUp.emailAddress;
    }
    const result = await sendSignupCode(signUp, values, pendingAttempt.current, () => setAwaitingCode(true));
    recordCodeSent(signUp.id);
    return result;
  }

  async function registerSocial(provider: SocialProvider): Promise<SignupResult> {
    // This app ships only on native; browser rendering is a UI review tool.
    if (Platform.OS === 'web') {
      return { kind: 'incomplete', message: 'Please use the iOS or Android app to continue with your social account.' };
    }
    const result = await startSSOFlow({
      strategy: `oauth_${provider}`,
      redirectUrl: makeRedirectUri({ scheme: 'flower-shop', path: 'signup' }),
    });
    const outcome = await finishSocialSignup(result, pendingAttempt.current, () => setAwaitingCode(true));
    if (outcome.kind === 'verification' && result.signUp) recordCodeSent(result.signUp.id);
    return outcome;
  }

  return { register, registerSocial, ready: isLoaded, isSignedIn: Boolean(isSignedIn), awaitingCode,
    verificationEmail: sentAt ? signUp?.emailAddress ?? undefined : undefined };
}
