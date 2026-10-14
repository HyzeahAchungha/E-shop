import { useRouter } from 'expo-router';

import { VerificationForm } from '@/features/auth/VerificationForm';
import { useSignedInRedirect } from '@/features/auth/useSignedInRedirect';
import { useVerification } from '@/features/auth/useVerification';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedVerification({ onBack }: { onBack: () => void }) {
  const verification = useVerification();
  useSignedInRedirect();
  return <VerificationForm {...verification} onBack={onBack} />;
}

export default function VerificationRoute() {
  const router = useRouter();
  const onBack = () => router.dismissTo('/signup');
  return hasClerkConfiguration ? <ConnectedVerification onBack={onBack} /> : <VerificationForm onBack={onBack} />;
}
