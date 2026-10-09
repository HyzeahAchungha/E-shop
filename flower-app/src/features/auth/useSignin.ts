import { useAuth, useSSO } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

import type { SocialProvider } from './signup-actions';
import { finishSocialSignin, signInWithPassword, type SigninResult, type SigninValues } from './signin-actions';

export function useSignin() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();

  async function login(values: SigninValues): Promise<SigninResult> {
    if (!isLoaded || !signIn || !setActive) throw new Error('Sign-in is loading.');
    return signInWithPassword(signIn, setActive, values);
  }

  async function loginSocial(provider: SocialProvider): Promise<SigninResult> {
    if (Platform.OS === 'web') {
      return { kind: 'incomplete', message: 'Please use the iOS or Android app to continue with your social account.' };
    }
    if (!isLoaded) throw new Error('Sign-in is loading.');
    const result = await startSSOFlow({
      strategy: `oauth_${provider}`,
      redirectUrl: makeRedirectUri({ scheme: 'flower-shop', path: 'signin' }),
    });
    return finishSocialSignin(result);
  }

  return { login, loginSocial, ready: isLoaded, isSignedIn: Boolean(isSignedIn) };
}
