import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPin } from '@/components/ui/LocationPin';
import { profileErrorMessage } from '@/features/profile/profile-errors';
import { colors, typography } from '@/theme';
import type { LocationInput, SavedLocation } from '@/types/location';
import type { DeviceLocationResult } from './location-actions';
import type { LocationSetupStatus } from './useLocationSetup';

type Props = {
  status?: LocationSetupStatus;
  /** Asks for permission and finds the location. Defaults to "not available" when missing. */
  findLocation?: () => Promise<DeviceLocationResult>;
  /** Saves the location found. Missing while the server address is not configured. */
  save?: (location: LocationInput) => Promise<SavedLocation>;
  retry?: () => void;
  onSignIn: () => void;
};

const MESSAGES = {
  denied: 'Location access was not allowed. You can try again, or enter your location manually.',
  deniedForever: 'Location access is turned off for Flower Shop. Turn it on in Settings, or enter your location manually.',
  servicesOff: 'Location services are switched off on this phone. Turn them on, or enter your location manually.',
  unavailable: 'We could not find your location. Please try again, or enter your location manually.',
  manual: 'Entering a location manually is coming soon.',
  notAvailable: 'Saving your location is not available yet. Please try again once the app is connected to its server.',
} as const;

export function LocationForm({ status = 'form', findLocation, save, retry, onSignIn }: Props) {
  const blockBack = status === 'form' || status === 'saved';

  // There is no back arrow on this screen, so Android's system Back must not leave it either.
  useEffect(() => {
    if (!blockBack) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [blockBack]);

  return (
    <SafeAreaView style={styles.screen}>
      {status === 'form' ? <ChooseBody findLocation={findLocation} save={save} /> : <Message status={status} retry={retry} onSignIn={onSignIn} />}
    </SafeAreaView>
  );
}

function Message({ status, retry, onSignIn }: { status: LocationSetupStatus; retry?: () => void; onSignIn: () => void }) {
  return (
    <View style={styles.message}>
      {status === 'loading' && <>
        <ActivityIndicator color={colors.primary} />
        <Text accessibilityLiveRegion="polite" style={styles.messageText}>Checking your location…</Text>
      </>}
      {status === 'signed-out' && <>
        <Text accessibilityRole="header" style={styles.heading}>What is Your Location?</Text>
        <Text style={styles.messageText}>Sign in to set your location.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Go to Sign In" onPress={onSignIn} style={styles.linkButton}>
          <Text style={styles.link}>Go to Sign In</Text>
        </Pressable>
      </>}
      {status === 'load-error' && <>
        <Text accessibilityRole="header" style={styles.heading}>What is Your Location?</Text>
        <Text accessibilityRole="alert" style={styles.messageText}>We could not check your location. Check your connection and try again.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Try again" onPress={retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </>}
      {status === 'saved' && <>
        <Text accessibilityRole="header" style={styles.heading}>You’re all set</Text>
        <Text style={styles.messageText}>Your location is already saved. Your next screen is coming soon.</Text>
      </>}
    </View>
  );
}

function ChooseBody({ findLocation, save }: Pick<Props, 'findLocation' | 'save'>) {
  const [busy, setBusy] = useState<'finding' | 'saving' | null>(null);
  const [notice, setNotice] = useState('');
  const [needsSettings, setNeedsSettings] = useState(false);
  const [saved, setSaved] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const locked = busy !== null || saved;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function allow() {
    if (inFlight.current || locked) return;
    inFlight.current = true;
    setNotice('');
    setNeedsSettings(false);
    try {
      if (!findLocation) {
        setNotice(MESSAGES.notAvailable);
        return;
      }
      setBusy('finding');
      const result = await findLocation();
      if (!mounted.current) return;
      if (result.kind === 'denied') {
        setNotice(result.canAskAgain ? MESSAGES.denied : MESSAGES.deniedForever);
        setNeedsSettings(!result.canAskAgain);
      } else if (result.kind === 'services-off') {
        setNotice(MESSAGES.servicesOff);
      } else if (result.kind === 'unavailable') {
        setNotice(MESSAGES.unavailable);
      } else if (!save) {
        // Never pretend a location was saved when there is no server to save it.
        setNotice(MESSAGES.notAvailable);
      } else {
        setBusy('saving');
        await save(result.location);
        if (mounted.current) setSaved(true);
      }
    } catch (error) {
      if (mounted.current) setNotice(profileErrorMessage(error));
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        <LocationPin />
        <Text accessibilityRole="header" style={[styles.heading, styles.title]}>What is Your Location?</Text>
        <Text style={styles.subtitle}>To Find Nearby Florist.</Text>

        {(notice || saved) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>
          {saved ? 'Your location is saved. Your next screen is coming soon.' : notice}
        </Text>}
        {needsSettings && !saved && <Pressable accessibilityRole="button" accessibilityLabel="Open Settings" onPress={() => void Linking.openSettings()} style={styles.linkButton}>
          <Text style={styles.link}>Open Settings</Text>
        </Pressable>}

        <Pressable accessibilityRole="button" accessibilityLabel="Allow Location Access" aria-busy={busy !== null} disabled={locked}
          style={({ pressed }) => [styles.submit, pressed && styles.pressed, locked && styles.disabled]} onPress={() => void allow()}>
          {busy ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitText}>Allow Location Access</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Enter Location Manually" disabled={locked}
          style={({ pressed }) => [styles.manual, pressed && styles.pressed, locked && styles.disabled]}
          // The manual entry screen has not been supplied yet, so this says so instead of doing nothing.
          onPress={() => { setNeedsSettings(false); setNotice(MESSAGES.manual); }}>
          <Text style={styles.manualText}>Enter Location Manually</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 36 },
  content: { width: '100%', maxWidth: 440 },
  heading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 36, textAlign: 'center', color: colors.text },
  title: { marginTop: 34 },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, textAlign: 'center', color: colors.textMuted, marginTop: 10 },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 20 },
  submit: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 34 },
  submitText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background, textAlign: 'center' },
  manual: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  manualText: { fontFamily: typography.brand, fontSize: 17, lineHeight: 24, color: colors.primary, textAlign: 'center' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  messageText: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center', maxWidth: 320 },
  button: { minHeight: 52, paddingHorizontal: 32, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { fontFamily: typography.brand, fontSize: 17, color: colors.background },
  linkButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  link: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.primary, textDecorationLine: 'underline' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
