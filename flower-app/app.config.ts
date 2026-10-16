import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Flower Shop',
  slug: 'flower-app',
  plugins: [
    ...(config.plugins ?? []),
    ['@clerk/expo', { appleSignIn: false }],
    'expo-secure-store',
    'expo-web-browser',
    // Photo library only: the profile picture is chosen from existing photos, never taken with the camera.
    ['expo-image-picker', { photosPermission: 'Allow Flower Shop to use your photos so you can choose a profile picture.', cameraPermission: false, microphonePermission: false }],
    // Location only while the app is open, to find nearby florists. No "always", background or motion access.
    ['expo-location', {
      locationWhenInUsePermission: 'Allow Flower Shop to use your location to find florists near you.',
      locationAlwaysAndWhenInUsePermission: false,
      locationAlwaysPermission: false,
      motionUsagePermission: false,
      isIosBackgroundLocationEnabled: false,
      isAndroidBackgroundLocationEnabled: false,
      isAndroidForegroundServiceEnabled: false,
    }],
  ],
  // Browser rendering is a development review tool, not a shipping platform.
  platforms: process.env.FLOWER_WEB_PREVIEW === '1' ? ['ios', 'android', 'web'] : ['ios', 'android'],
});
