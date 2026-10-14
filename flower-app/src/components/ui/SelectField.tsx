import Feather from '@expo/vector-icons/Feather';
import { useId, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';
import { SelectModal, type SelectOption } from './SelectModal';

type Props = {
  label: string;
  placeholder?: string;
  options: readonly SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

// Same look as AuthField: grey box, 10px corners. Opens a bottom sheet to pick one option.
export function SelectField({ label, placeholder = 'Select', options, value, onChange, error, disabled = false }: Props) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <View style={styles.field}>
      <Text nativeID={labelId} style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityValue={{ text: selected?.label ?? 'Not selected' }}
        aria-labelledby={labelId} disabled={disabled} onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.box, Boolean(error) && styles.invalid, pressed && styles.pressed, disabled && styles.disabled]}>
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>{selected?.label ?? placeholder}</Text>
        <Feather name="chevron-down" size={20} color={colors.text} />
      </Pressable>
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <SelectModal visible={open} title={label} options={options} selected={value} onClose={() => setOpen(false)}
        onSelect={(next) => { onChange(next); setOpen(false); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: typography.body, fontSize: 15, color: colors.text, lineHeight: 21 },
  box: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, minHeight: 50, paddingHorizontal: 16, borderWidth: 1, borderColor: 'transparent' },
  value: { flex: 1, fontFamily: typography.body, fontSize: 15, color: colors.text },
  placeholder: { color: colors.textMuted },
  invalid: { borderColor: '#B42318' },
  error: { color: '#B42318', fontFamily: typography.body, fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
