import type { useSignIn } from '@clerk/expo/legacy';

type SignInResource = NonNullable<ReturnType<typeof useSignIn>['signIn']>;

export const RESET_STRATEGY = 'reset_password_email_code' as const;
export const MIN_PASSWORD_LENGTH = 8;

export type ResetCodeSent = { signInId: string };
export type ResetCodeResult = { kind: 'verified' } | { kind: 'incomplete'; message: string };
export type NewPasswordResult = { kind: 'reset' } | { kind: 'incomplete'; message: string };

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** The email factor Clerk offers for this attempt, needed to resend the code. */
export function findResetEmailAddressId(factors: SignInResource['supportedFirstFactors']): string | null {
  const factor = factors?.find((candidate) => candidate.strategy === RESET_STRATEGY);
  return factor && 'emailAddressId' in factor ? factor.emailAddressId : null;
}

// Step 1: Clerk creates the attempt and emails the six-digit code in one call.
export async function requestResetCode(
  signIn: Pick<SignInResource, 'create'>,
  email: string,
): Promise<ResetCodeSent> {
  const identifier = email.trim();
  if (!isValidEmail(identifier)) throw new Error('Enter a valid email address.');
  const attempt = await signIn.create({ strategy: RESET_STRATEGY, identifier });
  if (attempt.status !== 'needs_first_factor' || !attempt.id) throw new Error('Password reset could not be started.');
  return { signInId: attempt.id };
}

// Step 2: a correct code moves the attempt to "needs_new_password". No session exists yet.
export async function verifyResetCode(
  signIn: Pick<SignInResource, 'status' | 'attemptFirstFactor'>,
  code: string,
): Promise<ResetCodeResult> {
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the complete six-digit code.');
  // A verified attempt must not spend its single-use code a second time.
  const result = signIn.status === 'needs_new_password'
    ? signIn : await signIn.attemptFirstFactor({ strategy: RESET_STRATEGY, code });
  if (result.status !== 'needs_new_password') {
    return { kind: 'incomplete', message: 'Your account needs another verification step before the password can be reset. That screen will be added next.' };
  }
  return { kind: 'verified' };
}

export async function resendResetCode(
  signIn: Pick<SignInResource, 'supportedFirstFactors' | 'prepareFirstFactor'>,
  secondsRemaining: number,
  onSent: () => void,
): Promise<void> {
  const emailAddressId = findResetEmailAddressId(signIn.supportedFirstFactors);
  if (!emailAddressId) throw new Error('No pending password reset.');
  if (secondsRemaining > 0) throw new Error('Please wait before resending.');
  await signIn.prepareFirstFactor({ strategy: RESET_STRATEGY, emailAddressId });
  onSent();
}

// Step 3: set the password. This never activates a session; the user signs in with it.
export async function setNewPassword(
  signIn: Pick<SignInResource, 'id' | 'status' | 'resetPassword'>,
  password: string,
  onReset: (signInId?: string | null) => void,
): Promise<NewPasswordResult> {
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (signIn.status !== 'needs_new_password') throw new Error('Verify your reset code before choosing a new password.');
  // A reset usually means the old password may be known to someone else: end other sessions.
  const result = await signIn.resetPassword({ password, signOutOfOtherSessions: true });
  if (result.status !== 'complete') {
    return { kind: 'incomplete', message: 'Your account needs an additional verification step before the reset can finish. That screen will be added next.' };
  }
  onReset(result.id ?? signIn.id);
  return { kind: 'reset' };
}
