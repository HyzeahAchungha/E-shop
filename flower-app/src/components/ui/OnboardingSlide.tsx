import { isLoaded } from 'expo-font';
import type { ReactNode } from 'react';
import { type ImageSourcePropType, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowButton } from '@/components/ui/ArrowButton';
import { colors, typography } from '@/theme';

type OnboardingSlideProps = {
  step: 1 | 2 | 3;
  artwork: ImageSourcePropType;
  heading: ReactNode;
  description: string;
  backLabel: string;
  onBack: () => void;
  onNext: () => void;
  notice?: string | null;
};

export function OnboardingSlide({
  step, artwork, heading, description, backLabel, onBack, onNext, notice,
}: OnboardingSlideProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width, 480);
  const scale = Math.min(contentWidth / 393, (height - insets.top - insets.bottom) / 800);
  const regularFont = isLoaded(typography.body) ? typography.body : undefined;
  const semiboldFont = isLoaded(typography.brand) ? typography.brand : undefined;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.frame, { width: contentWidth, minHeight: height - insets.top }]}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip"
              onPress={onNext}
              style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
            >
              <Text style={[styles.skipText, { fontFamily: regularFont }]}>Skip</Text>
            </Pressable>
          </View>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[styles.artwork, { height: 410 * scale }]}
          >
            <Image
              source={artwork}
              accessible={false}
              resizeMode="contain"
              style={{ width: 250 * scale, height: (250 * 590 / 300) * scale, marginTop: 28 * scale }}
            />
          </View>
          <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}>
            <Image
              source={require('../../../assets/images/onboarding-curve.png')}
              accessible={false}
              resizeMode="stretch"
              style={styles.curve}
            />
            <Text accessibilityRole="header" style={[
              styles.heading, { fontFamily: semiboldFont, fontSize: width < 360 ? 23 : 25 },
            ]}>
              {heading}
            </Text>
            <Text style={[styles.description, { fontFamily: regularFont }]}>
              {description}
            </Text>
            <View style={styles.footer}>
              {notice && (
                <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[
                  styles.notice, { fontFamily: regularFont },
                ]}>{notice}</Text>
              )}
              <View style={styles.controls}>
                <ArrowButton direction="back" accessibilityLabel={backLabel} onPress={onBack} />
                <View
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel="Onboarding progress"
                  aria-valuemin={1}
                  aria-valuemax={3}
                  aria-valuenow={step}
                  aria-valuetext={`Step ${step} of 3`}
                  style={styles.dots}
                >
                  {[1, 2, 3].map((dot) => (
                    <View key={dot} style={[styles.dot, dot === step ? styles.activeDot : styles.inactiveDot]} />
                  ))}
                </View>
                <ArrowButton direction="next" accessibilityLabel="Next" onPress={onNext} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  frame: { flexGrow: 1 },
  header: { alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  skipButton: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  skipText: { fontSize: 16, color: colors.primary },
  pressed: { opacity: 0.7 },
  artwork: { alignItems: 'center', overflow: 'hidden' },
  panel: { flexGrow: 1, paddingTop: 36, paddingHorizontal: 24, backgroundColor: colors.background },
  curve: { position: 'absolute', top: -35, left: 0, width: '100%', height: 36 },
  heading: { fontWeight: '600', lineHeight: 31, textAlign: 'center', color: colors.text },
  description: { marginTop: 26, fontSize: 15, lineHeight: 23, textAlign: 'center', color: colors.textMuted },
  footer: { marginTop: 'auto', paddingTop: 48 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dot: { width: 10, height: 10, borderRadius: 7, backgroundColor: colors.primary },
  activeDot: { width: 14, height: 14 },
  inactiveDot: { opacity: 0.2 },
  notice: { fontSize: 14, lineHeight: 21, textAlign: 'center', color: colors.textMuted, marginBottom: 16 },
});
