import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

import { BrandSplash } from '@/components/ui/BrandSplash';

export default function SplashRoute() {
  const [fontLoaded, fontError] = useFonts({ Inter_600SemiBold });
  const ready = fontLoaded || Boolean(fontError);
  const onLayout = useCallback(() => {
    if (ready) void SplashScreen.hideAsync().catch(console.warn);
  }, [ready]);

  if (!ready) return null;

  // Keep this screen available for review. Add the welcome transition only
  // after that screen's implementation is approved.
  return <BrandSplash fontReady={fontLoaded} onLayout={onLayout} />;
}
