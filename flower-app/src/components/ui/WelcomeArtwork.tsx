import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

type WelcomeArtworkProps = {
  scale: number;
  fontReady: boolean;
};

export function WelcomeArtwork({ scale, fontReady }: WelcomeArtworkProps) {
  const tagFont = fontReady ? typography.brand : undefined;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ width: 393 * scale, height: 416 * scale }}
    >
      <View style={[styles.topShape, {
        width: 205 * scale, height: 265 * scale, right: -57 * scale, top: -143 * scale,
      }]}>
        <Image source={require('../../../assets/images/welcome-flourish.png')} style={[
          styles.flourish, { width: 52 * scale, height: 83 * scale, bottom: 8 * scale, left: 18 * scale },
        ]} />
      </View>
      <View style={[styles.bottomShape, {
        width: 142 * scale, height: 142 * scale, left: 3 * scale, top: 250 * scale,
      }]}>
        <Image source={require('../../../assets/images/welcome-flourish.png')} style={[
          styles.flourish, { width: 49 * scale, height: 78 * scale, top: 20 * scale, right: 5 * scale },
        ]} />
      </View>
      <View style={[styles.portrait, { left: 18 * scale, top: 0, width: 156 * scale }]}>
        <Image
          source={require('../../../assets/images/welcome-fresh.jpg')}
          resizeMode="cover"
          accessible={false}
          style={{ width: 156 * scale, height: 200 * scale, borderRadius: 90 * scale }}
        />
        <View style={[styles.tag, { backgroundColor: colors.primary, marginTop: -14 * scale }]}>
          <Text style={[styles.tagText, { fontFamily: tagFont, fontSize: 17 * scale }]}>#Fresh</Text>
        </View>
      </View>
      <View style={[styles.portrait, { right: 25 * scale, top: 137 * scale, width: 201 * scale }]}>
        <Image
          source={require('../../../assets/images/welcome-flowers.jpg')}
          resizeMode="cover"
          accessible={false}
          style={{ width: 201 * scale, height: 256 * scale, borderRadius: 110 * scale }}
        />
        <View style={[styles.tag, { backgroundColor: colors.accent, marginTop: -14 * scale }]}>
          <Text style={[styles.tagText, { fontFamily: tagFont, fontSize: 17 * scale }]}>#Flowers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topShape: { position: 'absolute', backgroundColor: colors.surface, borderRadius: 110, transform: [{ rotate: '45deg' }] },
  bottomShape: { position: 'absolute', backgroundColor: colors.surface, borderRadius: 100 },
  flourish: { position: 'absolute' },
  portrait: { position: 'absolute', alignItems: 'center' },
  tag: { borderRadius: 40, borderWidth: 2, borderColor: colors.background, paddingHorizontal: 12, paddingVertical: 7 },
  tagText: { color: colors.background, fontWeight: '600' },
});
