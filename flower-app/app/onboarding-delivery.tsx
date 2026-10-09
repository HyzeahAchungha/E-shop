import { type NativeStackNavigationProp, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { OnboardingSlide } from '@/components/ui/OnboardingSlide';
import { completeOnboarding } from '@/store/onboarding';
import { colors } from '@/theme';

type CompletionNavigation = NativeStackNavigationProp<{ '(auth)/signup': undefined }>;

export default function DeliveryOnboardingRoute() {
  const router = useRouter();
  const navigation = useNavigation<CompletionNavigation>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const finishOnboarding = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setNotice(null);

    try {
      await completeOnboarding();
      if (mounted.current) {
        // Remove the completed onboarding flow from the native back stack.
        navigation.reset({ index: 0, routes: [{ name: '(auth)/signup' }] });
      }
    } catch {
      if (mounted.current) setNotice('We couldn’t save your progress. Please try again.');
    } finally {
      inFlight.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <OnboardingSlide
      step={3}
      artwork={require('../assets/images/delivery-preview.png')}
      heading={<><Text style={{ color: colors.primary }}>From Cart to Door:</Text> Swift{'\u00a0'}&{'\n'}Reliable Flower Delivery</>}
      description="Track your order every step of the way, from your favorite florist to your doorstep."
      backLabel="Back to second onboarding screen"
      onBack={() => router.dismissTo('/onboarding-shopping')}
      onNext={() => { void finishOnboarding(); }}
      showSkip={false}
      nextLabel="Continue to signup"
      busy={saving}
      notice={notice}
    />
  );
}
