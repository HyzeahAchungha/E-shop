import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

const SIZE = 126;

// The round badge with the purple map pin from the design. The pin is drawn with plain views
// (a rounded square turned 45° so its sharp corner points down, with a white dot) to need no image or icon font.
export function LocationPin() {
  return (
    <View style={styles.circle} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.pin} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  pin: { width: 40, height: 40, borderRadius: 20, borderBottomRightRadius: 4, backgroundColor: colors.primary, transform: [{ rotate: '45deg' }], marginTop: -4 },
  dot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.background, marginTop: -12 },
});
