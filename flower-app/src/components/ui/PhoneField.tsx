import Feather from '@expo/vector-icons/Feather';
import { forwardRef, useId, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COUNTRIES, filterCountries, findCountry } from '@/features/profile/countries';
import { colors, typography } from '@/theme';
import { SelectModal, type SelectOption } from './SelectModal';

type Props = {
  label: string;
  countryIso: string;
  onCountryChange: (iso: string) => void;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  editable?: boolean;
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
};

const toOption = (country: { iso: string; name: string; dial: string }): SelectOption => ({ value: country.iso, label: country.name, hint: `+${country.dial}` });

// Country code dropdown ("+1 ⌄") followed by the number, as in the design. Values are stored by ISO
// code because several countries share a calling code.
export const PhoneField = forwardRef<TextInput, Props>(function PhoneField(
  { label, countryIso, onCountryChange, value, onChangeText, error, editable = true, returnKeyType, onSubmitEditing }, ref,
) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const country = findCountry(countryIso);
  const options = useMemo(() => COUNTRIES.map(toOption), []);
  return (
    <View style={styles.field}>
      <Text nativeID={labelId} style={styles.label}>{label}</Text>
      <View style={[styles.row, Boolean(error) && styles.invalid]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Country code, ${country?.name ?? 'not selected'}, plus ${country?.dial ?? ''}`}
          disabled={!editable} onPress={() => setOpen(true)} style={({ pressed }) => [styles.code, pressed && styles.pressed]}>
          <Text style={styles.codeText}>{country ? `+${country.dial}` : '+'}</Text>
          <Feather name="chevron-down" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.divider} />
        <TextInput ref={ref} accessibilityLabel={label} aria-labelledby={labelId} value={value} onChangeText={onChangeText}
          placeholder="Enter Phone Number" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" inputMode="tel"
          autoComplete="tel-national" textContentType="telephoneNumber" autoCorrect={false} editable={editable}
          returnKeyType={returnKeyType} onSubmitEditing={onSubmitEditing} maxLength={30} style={styles.input} />
      </View>
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <SelectModal visible={open} title="Country code" options={options} selected={countryIso} onClose={() => setOpen(false)}
        onSelect={(iso) => { onCountryChange(iso); setOpen(false); }} searchPlaceholder="Search country or code"
        filter={(query) => filterCountries(query).map(toOption)} />
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: typography.body, fontSize: 15, color: colors.text, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, minHeight: 50, borderWidth: 1, borderColor: 'transparent' },
  code: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48, paddingLeft: 16, paddingRight: 10 },
  codeText: { fontFamily: typography.body, fontSize: 15, color: colors.text },
  divider: { width: 1, height: 22, backgroundColor: '#D4D4D4' },
  input: { flex: 1, minWidth: 0, fontFamily: typography.body, fontSize: 15, color: colors.text, paddingHorizontal: 12, paddingVertical: 14 },
  invalid: { borderColor: '#B42318' },
  error: { color: '#B42318', fontFamily: typography.body, fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.75 },
});
