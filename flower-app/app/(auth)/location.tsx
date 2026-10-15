import { useRouter } from 'expo-router';

import { LocationForm } from '@/features/location/LocationForm';
import { findDeviceLocation, useLocationSetup } from '@/features/location/useLocationSetup';
import { hasClerkConfiguration } from '@/lib/clerk';

function ConnectedLocation({ onSignIn }: { onSignIn: () => void }) {
  const setup = useLocationSetup();
  return <LocationForm {...setup} findLocation={findDeviceLocation} onSignIn={onSignIn} />;
}

export default function LocationRoute() {
  const router = useRouter();
  const onSignIn = () => router.replace('/signin');
  // Without a Clerk key the screen stays reviewable: it can find the location but says saving is unavailable.
  return hasClerkConfiguration
    ? <ConnectedLocation onSignIn={onSignIn} />
    : <LocationForm findLocation={findDeviceLocation} onSignIn={onSignIn} />;
}
