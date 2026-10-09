import { useRouter } from 'expo-router';

import { SignupForm } from '@/features/auth/SignupForm';
import { useSignup } from '@/features/auth/useSignup';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedSignup() {
  const signup = useSignup();
  const router = useRouter();
  return <SignupForm {...signup} onVerification={() => router.push('/verify-code')} />;
}

export default function SignupRoute() {
  return hasClerkConfiguration ? <ConnectedSignup /> : <SignupForm />;
}
