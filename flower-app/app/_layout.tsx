import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { clerkPublishableKey } from '@/lib/clerk';

// Hold the OS launch screen until the bundled fonts and first layout are ready.
void SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function RootLayout() {
  const [fontLoaded, fontError] = useFonts({ Inter_400Regular, Inter_600SemiBold });
  const ready = fontLoaded || Boolean(fontError);
  const onLayout = useCallback(() => {
    if (ready) void SplashScreen.hideAsync().catch(console.warn);
  }, [ready]);

  if (!ready) return null;

  const content = (
    <SafeAreaProvider>
      <View style={styles.screen} onLayout={onLayout}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: styles.screen }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="onboarding-shopping" />
          <Stack.Screen name="onboarding-delivery" />
          <Stack.Screen name="(auth)/signup" />
          <Stack.Screen name="(auth)/signin" />
          <Stack.Screen name="(auth)/verify-code" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );

  // Permit UI review without a key. The unconfigured form cannot authenticate.
  return clerkPublishableKey ? (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {content}
    </ClerkProvider>
  ) : content;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
