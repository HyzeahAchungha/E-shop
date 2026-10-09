import { useRouter } from 'expo-router';

import { SignupForm } from '@/features/auth/SignupForm';
import { useSignup } from '@/features/auth/useSignup';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedSignup({ onSignIn }: { onSignIn: () => void }) {
  const signup = useSignup();
  const router = useRouter();
  return <SignupForm {...signup} onVerification={() => router.push('/verify-code')} onSignIn={onSignIn} />;
}

export default function SignupRoute() {
  const router = useRouter();
  const onSignIn = () => router.dismissTo('/signin');
  return hasClerkConfiguration ? <ConnectedSignup onSignIn={onSignIn} /> : <SignupForm onSignIn={onSignIn} />;
}
