import { isLoaded } from 'expo-font';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { BrandSplash } from '@/components/ui/BrandSplash';
import { typography } from '@/theme';

export default function SplashRoute() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const onLayout = useCallback(() => setVisible(true), []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => router.replace('/welcome'), 1500);
    return () => clearTimeout(timer);
  }, [router, visible]);

  return <BrandSplash fontReady={isLoaded(typography.brand)} onLayout={onLayout} />;
}
