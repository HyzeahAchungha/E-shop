import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Once Clerk reports a signed-in session on an auth screen (just after signing in, signing up or
// verifying an email, or on a later launch), continue to Complete Profile. That screen asks the API
// whether the profile is already done, so returning users with a finished profile are not asked again.
export function useSignedInRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/complete-profile');
  }, [isLoaded, isSignedIn, router]);
}
