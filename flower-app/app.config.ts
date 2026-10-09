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
  ],
  // Browser rendering is a development review tool, not a shipping platform.
  platforms: process.env.FLOWER_WEB_PREVIEW === '1' ? ['ios', 'android', 'web'] : ['ios', 'android'],
});
