import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type Props = { uri?: string | null; busy?: boolean; disabled?: boolean; onPress: () => void };

const SIZE = 126;

// The round profile picture with the purple silhouette and pencil badge from the design.
export function AvatarPicker({ uri, busy = false, disabled = false, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityLabel={uri ? 'Change profile photo' : 'Choose profile photo'}
        disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [styles.circle, pressed && styles.pressed]}>
        {uri ? <Image source={{ uri }} accessibilityIgnoresInvertColors style={styles.photo} /> : (
          <View style={styles.silhouette} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.head} />
            <View style={styles.body} />
          </View>
        )}
        {busy && <View style={styles.busy}><ActivityIndicator color={colors.primary} /></View>}
      </Pressable>
      <View pointerEvents="none" style={styles.badge}>
        <Feather name="edit-3" size={15} color={colors.background} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignSelf: 'center' },
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: SIZE, height: SIZE },
  silhouette: { alignItems: 'center', marginTop: 2 },
  head: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary },
  body: { width: 44, height: 28, borderRadius: 14, backgroundColor: colors.primary, marginTop: 5 },
  badge: { position: 'absolute', right: 2, bottom: 4, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    borderWidth: 3, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  busy: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8 },
});
