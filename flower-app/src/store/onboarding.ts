import AsyncStorage from '@react-native-async-storage/async-storage';

// A device-local UI preference, never an authentication or authorization signal.
const COMPLETION_KEY = '@flower-shop/onboarding-completed-v1';

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(COMPLETION_KEY)) === 'true';
}

export async function completeOnboarding(): Promise<void> {
  await AsyncStorage.setItem(COMPLETION_KEY, 'true');
}
