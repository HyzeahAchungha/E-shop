import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

export type SelectOption = { value: string; label: string; hint?: string };

type Props = {
  visible: boolean;
  title: string;
  options: readonly SelectOption[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  /** Shows a search box. `filter` narrows the options for the typed text. */
  searchPlaceholder?: string;
  filter?: (query: string) => readonly SelectOption[];
};

const ROW_HEIGHT = 52;

// A bottom sheet list used for the country code and gender dropdowns.
export function SelectModal({ visible, title, options, selected, onSelect, onClose, searchPlaceholder, filter }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const shown = filter && query ? filter(query) : options;

  function close() {
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" style={styles.backdrop} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Close ${title}`} hitSlop={8} onPress={close} style={styles.close}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>
          {searchPlaceholder && filter && (
            <TextInput accessibilityLabel={searchPlaceholder} value={query} onChangeText={setQuery} placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} returnKeyType="search" style={styles.search} />
          )}
          <FlatList data={shown} keyExtractor={(option) => option.value} keyboardShouldPersistTaps="handled"
            getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
            initialNumToRender={14} windowSize={9}
            ListEmptyComponent={<Text style={styles.empty}>No matches.</Text>}
            renderItem={({ item }) => {
              const active = item.value === selected;
              return (
                <Pressable accessibilityRole="button" accessibilityState={{ selected: active }}
                  accessibilityLabel={item.hint ? `${item.label}, ${item.hint}` : item.label}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  onPress={() => { setQuery(''); onSelect(item.value); }}>
                  <Text style={[styles.rowLabel, active && styles.rowActive]} numberOfLines={1}>{item.label}</Text>
                  {item.hint ? <Text style={styles.rowHint}>{item.hint}</Text> : null}
                  {active ? <Feather name="check" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(36,36,36,0.45)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '72%', paddingTop: 18, paddingHorizontal: 20, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: typography.brand, fontSize: 20, lineHeight: 28, color: colors.text },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  search: { backgroundColor: colors.surface, borderRadius: 10, minHeight: 46, paddingHorizontal: 16, fontFamily: typography.body, fontSize: 15, color: colors.text, marginBottom: 8 },
  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { flex: 1, fontFamily: typography.body, fontSize: 16, color: colors.text },
  rowActive: { fontFamily: typography.brand, color: colors.primary },
  rowHint: { fontFamily: typography.body, fontSize: 15, color: colors.textMuted },
  empty: { fontFamily: typography.body, fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  pressed: { opacity: 0.6 },
});
