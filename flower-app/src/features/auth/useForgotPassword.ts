import { useAuth } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';

import { recordCodeSent } from '@/store/email-verification';
import { requestResetCode } from './password-reset-actions';

export function useForgotPassword() {
  const { isLoaded, signIn } = useSignIn();
  const { isSignedIn } = useAuth();

  async function sendCode(email: string): Promise<void> {
    if (!isLoaded || !signIn) throw new Error('Authentication is loading.');
    const { signInId } = await requestResetCode(signIn, email);
    // Starts the 60 second resend countdown on the code screen.
    recordCodeSent(signInId);
  }

  return { sendCode, ready: isLoaded, isSignedIn: Boolean(isSignedIn) };
}
