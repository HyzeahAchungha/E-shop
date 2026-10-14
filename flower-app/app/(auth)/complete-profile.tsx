import { useRouter } from 'expo-router';

import { CompleteProfileForm } from '@/features/profile/CompleteProfileForm';
import { pickAvatar } from '@/features/profile/pick-avatar';
import { useCompleteProfile } from '@/features/profile/useCompleteProfile';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedCompleteProfile({ onSignIn }: { onSignIn: () => void }) {
  const profile = useCompleteProfile();
  return <CompleteProfileForm {...profile} pickAvatar={pickAvatar} onSignIn={onSignIn} />;
}

export default function CompleteProfileRoute() {
  const router = useRouter();
  const onSignIn = () => router.replace('/signin');
  // Without a Clerk key the form stays reviewable and says that saving is unavailable.
  return hasClerkConfiguration
    ? <ConnectedCompleteProfile onSignIn={onSignIn} />
    : <CompleteProfileForm pickAvatar={pickAvatar} onSignIn={onSignIn} />;
}
