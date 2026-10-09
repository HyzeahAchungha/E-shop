import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

type BrandSplashProps = {
  fontReady: boolean;
  onLayout: () => void;
};

/** Shared brand artwork for the first screen shown on every cold launch. */
export function BrandSplash({ fontReady, onLayout }: BrandSplashProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 393, height / 852, 1.35);
  const floralSize = 280 * scale;

  return (
    <View style={styles.screen} onLayout={onLayout}>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={require('../../../assets/images/floral-branch.png')}
          accessible={false}
          resizeMode="contain"
          style={[
            styles.decoration,
            {
              width: floralSize,
              height: floralSize,
              top: height * 0.105,
              right: -floralSize * 0.38,
            },
          ]}
        />
        <Image
          source={require('../../../assets/images/floral-branch.png')}
          accessible={false}
          resizeMode="contain"
          style={[
            styles.decoration,
            styles.bottomFlowers,
            {
              width: floralSize,
              height: floralSize,
              bottom: height * 0.055,
              left: -floralSize * 0.38,
            },
          ]}
        />
      </View>
      <SafeAreaView style={styles.content}>
        <View style={[styles.brand, { paddingTop: 24 * scale }]}>
          <Image
            source={require('../../../assets/images/flower-logo.png')}
            accessible={false}
            style={{ width: 72 * scale, height: 72 * scale }}
          />
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              fontReady && styles.brandFont,
              { fontSize: 30 * scale, marginTop: 18 * scale },
            ]}
          >
            Flower Shop
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  decoration: { position: 'absolute' },
  bottomFlowers: { transform: [{ rotate: '180deg' }] },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  brand: { alignItems: 'center', paddingHorizontal: 24 },
  title: { color: colors.text, fontWeight: '600', textAlign: 'center' },
  brandFont: { fontFamily: typography.brand },
});
