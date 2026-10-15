import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { CompleteProfileForm } from '@/features/profile/CompleteProfileForm';
import { pickAvatar } from '@/features/profile/pick-avatar';
import { useCompleteProfile } from '@/features/profile/useCompleteProfile';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedCompleteProfile({ onSignIn, onDone }: { onSignIn: () => void; onDone: () => void }) {
  const profile = useCompleteProfile();
  // A user whose profile was already complete skips straight to the location step.
  useEffect(() => {
    if (profile.status === 'complete') onDone();
  }, [profile.status, onDone]);
  return <CompleteProfileForm {...profile} pickAvatar={pickAvatar} onSaved={onDone} onSignIn={onSignIn} />;
}

export default function CompleteProfileRoute() {
  const router = useRouter();
  const onSignIn = () => router.replace('/signin');
  const onDone = useCallback(() => router.replace('/location'), [router]);
  // Without a Clerk key the form stays reviewable and says that saving is unavailable.
  return hasClerkConfiguration
    ? <ConnectedCompleteProfile onSignIn={onSignIn} onDone={onDone} />
    : <CompleteProfileForm pickAvatar={pickAvatar} onSignIn={onSignIn} />;
}
