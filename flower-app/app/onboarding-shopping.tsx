import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { OnboardingSlide } from '@/components/ui/OnboardingSlide';
import { colors } from '@/theme';

export default function ShoppingOnboardingRoute() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <OnboardingSlide
      step={2}
      artwork={require('../assets/images/shopping-preview.png')}
      heading={<><Text style={{ color: colors.primary }}>Seamless</Text> Flower{'\n'}Shopping Experience</>}
      description="Discover beautiful blooms, explore special offers, and find the perfect flowers for every occasion."
      backLabel="Back to first onboarding screen"
      onBack={() => router.dismissTo('/onboarding')}
      onNext={() => setNotice('The final onboarding step will be available soon.')}
      notice={notice}
    />
  );
}
