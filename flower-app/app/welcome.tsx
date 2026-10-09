import { isLoaded } from 'expo-font';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { WelcomeArtwork } from '@/components/ui/WelcomeArtwork';
import { colors, typography } from '@/theme';

export default function WelcomeRoute() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width, 480);
  const artworkScale = Math.min(contentWidth / 393, (height - insets.top - insets.bottom) / 771);
  const headingSize = width < 360 ? 22 : 25;
  const regularFont = isLoaded(typography.body) ? typography.body : undefined;
  const semiboldFont = isLoaded(typography.brand) ? typography.brand : undefined;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth }]}>
          <WelcomeArtwork scale={artworkScale} fontReady={Boolean(semiboldFont)} />
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={[
              styles.heading, { fontFamily: semiboldFont, fontSize: headingSize, lineHeight: headingSize * 1.25 },
            ]}>
              Your Premier Choice for{'\n'}
              <Text style={styles.highlight}>Effortless Flower Delivery</Text>
            </Text>
            <Text style={[styles.description, { fontFamily: regularFont }]}>
              Fresh flowers for every occasion, delivered with care to your doorstep.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/onboarding')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={[styles.buttonText, { fontFamily: semiboldFont }]}>Let’s Get Started</Text>
            </Pressable>
            <View style={styles.signInRow}>
              <Text style={[styles.accountText, { fontFamily: regularFont }]}>Already have an account?</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign In"
                onPress={() => router.push('/signin')}
                style={({ pressed }) => [styles.signInButton, pressed && styles.pressed]}
              >
                <Text style={[styles.signInText, { fontFamily: semiboldFont }]}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 24, paddingBottom: 24 },
  content: { alignItems: 'center' },
  copy: { alignSelf: 'stretch', paddingHorizontal: 24, marginTop: 32 },
  heading: { color: colors.text, textAlign: 'center', fontWeight: '600' },
  highlight: { color: colors.primary },
  description: { color: colors.textMuted, textAlign: 'center', fontSize: 15, lineHeight: 23, marginTop: 26 },
  primaryButton: { backgroundColor: colors.primary, minHeight: 52, borderRadius: 32, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 14, marginTop: 26 },
  buttonText: { color: colors.background, fontSize: 18, textAlign: 'center', fontWeight: '600' },
  pressed: { opacity: 0.75 },
  signInRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 5, marginTop: 20 },
  accountText: { color: colors.text, fontSize: 16, lineHeight: 24 },
  signInButton: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
  signInText: { color: colors.primary, fontSize: 16, lineHeight: 24, fontWeight: '600', textDecorationLine: 'underline' },
});
