import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { SigninForm } from '@/features/auth/SigninForm';
import { useSignedInRedirect } from '@/features/auth/useSignedInRedirect';
import { useSignin } from '@/features/auth/useSignin';
import { hasClerkConfiguration } from '@/lib/clerk';
import { clearPasswordResetNotice, usePasswordResetNotice } from '@/store/password-reset';

type RouteProps = {
  passwordReset: boolean;
  onPasswordResetSeen: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
};

function ConnectedSignin(props: RouteProps) {
  const signin = useSignin();
  useSignedInRedirect();
  return <SigninForm {...signin} {...props} />;
}

export default function SigninRoute() {
  const router = useRouter();
  const passwordReset = usePasswordResetNotice();
  // The success message belongs to one visit: leaving Sign In clears it.
  useEffect(() => clearPasswordResetNotice, []);
  const props: RouteProps = {
    passwordReset,
    onPasswordResetSeen: clearPasswordResetNotice,
    onSignUp: () => router.dismissTo('/signup'),
    onForgotPassword: () => router.push('/forgot-password'),
  };
  return hasClerkConfiguration ? <ConnectedSignin {...props} /> : <SigninForm {...props} />;
}
