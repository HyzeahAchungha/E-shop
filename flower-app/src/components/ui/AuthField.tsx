import Feather from '@expo/vector-icons/Feather';
import { forwardRef, useId, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, typography } from '@/theme';

type Props = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export const AuthField = forwardRef<TextInput, Props>(function AuthField(
  { label, error, isPassword = false, editable = true, ...inputProps }, ref,
) {
  const labelId = useId();
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Text nativeID={labelId} style={styles.label}>{label}</Text>
      <View style={[styles.row, Boolean(error) && styles.invalid]}>
        <TextInput ref={ref} accessibilityLabel={label} aria-labelledby={labelId} placeholderTextColor={colors.textMuted}
          {...inputProps} style={styles.input} editable={editable} secureTextEntry={isPassword && !visible} />
        {isPassword && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          disabled={!editable} style={styles.eye} onPress={() => setVisible(!visible)}>
          <Feather name={visible ? 'eye' : 'eye-off'} size={23} color={colors.text} />
        </Pressable>}
      </View>
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: typography.body, fontSize: 15, color: colors.text, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, minHeight: 50, borderWidth: 1, borderColor: 'transparent' },
  input: { flex: 1, minWidth: 0, fontFamily: typography.body, fontSize: 15, color: colors.text, paddingHorizontal: 16, paddingVertical: 14 },
  eye: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  invalid: { borderColor: '#B42318' },
  error: { color: '#B42318', fontFamily: typography.body, fontSize: 13, lineHeight: 19 },
});
