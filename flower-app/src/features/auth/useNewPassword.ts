import { useSignIn } from '@clerk/expo/legacy';

import { closeResetAttempt, isResetAttemptClosed } from '@/store/password-reset';
import { setNewPassword } from './password-reset-actions';

export function useNewPassword() {
  const { isLoaded, signIn } = useSignIn();
  const hasPendingReset = Boolean(isLoaded && signIn?.status === 'needs_new_password' && !isResetAttemptClosed(signIn.id));

  async function submit(password: string) {
    if (!isLoaded || !signIn || !hasPendingReset) throw new Error('Start password reset first.');
    return setNewPassword(signIn, password, closeResetAttempt);
  }

  // Back abandons the reset: the verified attempt can no longer be used to set a password.
  function cancel() {
    closeResetAttempt(signIn?.id);
  }

  return { submit, cancel, ready: isLoaded, hasPendingReset };
}
