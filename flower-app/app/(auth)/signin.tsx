import { useRouter } from 'expo-router';

import { SigninForm } from '@/features/auth/SigninForm';
import { useSignin } from '@/features/auth/useSignin';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedSignin({ onSignUp }: { onSignUp: () => void }) {
  const signin = useSignin();
  return <SigninForm {...signin} onSignUp={onSignUp} />;
}

export default function SigninRoute() {
  const router = useRouter();
  const onSignUp = () => router.dismissTo('/signup');
  return hasClerkConfiguration ? <ConnectedSignin onSignUp={onSignUp} /> : <SigninForm onSignUp={onSignUp} />;
}
