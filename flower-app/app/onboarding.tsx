import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { OnboardingSlide } from '@/components/ui/OnboardingSlide';
import { colors } from '@/theme';

export default function OnboardingRoute() {
  const router = useRouter();

  return (
    <OnboardingSlide
      step={1}
      artwork={require('../assets/images/wishlist-preview.png')}
      heading={<>Craft Your <Text style={{ color: colors.primary }}>Ultimate{'\n'}Floral Collection</Text></>}
      description="Save your favorite flowers and bouquets, and keep every beautiful find in one place."
      backLabel="Back to welcome"
      onBack={() => router.dismissTo('/welcome')}
      onNext={() => router.push('/onboarding-shopping')}
    />
  );
}
