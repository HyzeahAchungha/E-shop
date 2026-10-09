import { isLoaded } from 'expo-font';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { BrandSplash } from '@/components/ui/BrandSplash';
import { hasCompletedOnboarding } from '@/store/onboarding';
import { typography } from '@/theme';

export default function SplashRoute() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const onLayout = useCallback(() => setVisible(true), []);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const minimumDisplay = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, 1500);
    });
    const completion = hasCompletedOnboarding().catch(() => {
      // If local storage is unavailable, keep the first-time flow usable.
      return false;
    });

    void Promise.all([completion, minimumDisplay]).then(([completed]) => {
      if (active) router.replace(completed ? '/signup' : '/welcome');
    });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [router, visible]);

  return <BrandSplash fontReady={isLoaded(typography.brand)} onLayout={onLayout} />;
}
