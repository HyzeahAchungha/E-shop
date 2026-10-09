import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type ArrowButtonProps = {
  direction: 'back' | 'next';
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export function ArrowButton({ direction, accessibilityLabel, onPress, disabled = false, busy = false }: ArrowButtonProps) {
  const back = direction === 'back';
  const arrowColor = back ? colors.primary : colors.background;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityState={{ disabled: disabled || busy, busy }}
      style={({ pressed }) => [styles.button, back ? styles.outlined : styles.filled, (pressed || disabled) && styles.pressed]}
    >
      {busy ? <ActivityIndicator color={arrowColor} /> : <View accessible={false} style={[styles.arrow, back && styles.back]}>
        <View style={[styles.shaft, { backgroundColor: arrowColor }]} />
        <View style={[styles.head, { borderColor: arrowColor }]} />
      </View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  outlined: { backgroundColor: colors.background },
  filled: { backgroundColor: colors.primary },
  pressed: { opacity: 0.7 },
  arrow: { width: 24, height: 24 },
  back: { transform: [{ rotate: '180deg' }] },
  shaft: { position: 'absolute', height: 2, width: 18, top: 11, left: 3, borderRadius: 1 },
  head: { position: 'absolute', width: 11, height: 11, borderTopWidth: 2, borderRightWidth: 2, top: 6.5, right: 3, transform: [{ rotate: '45deg' }] },
});
