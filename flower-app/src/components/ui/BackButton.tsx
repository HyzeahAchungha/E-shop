import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme';

type Props = { label: string; onPress: () => void; disabled?: boolean };

// The circular back arrow shared by the verification and password screens.
export function BackButton({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
      style={({ pressed }) => [styles.back, pressed && styles.pressed, disabled && styles.disabled]} onPress={onPress}>
      <Feather name="arrow-left" size={23} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#E6E6E6', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
