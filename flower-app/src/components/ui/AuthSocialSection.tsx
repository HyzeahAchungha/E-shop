import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SocialProvider } from '@/features/auth/signup-actions';
import { colors, typography } from '@/theme';

type Props = {
  mode: 'signup' | 'signin';
  disabled: boolean;
  busy?: SocialProvider | null;
  onSelect: (provider: SocialProvider) => void;
};

export function AuthSocialSection({ mode, disabled, busy, onSelect }: Props) {
  const action = mode === 'signup' ? 'sign up' : 'sign in';
  return (
    <>
      <View style={styles.divider}>
        <View style={styles.line} /><Text style={styles.dividerText}>Or {action} with</Text><View style={styles.line} />
      </View>
      <View style={styles.socialRow}>
        {(['apple', 'google', 'facebook'] as const).map((provider) => (
          <Pressable key={provider} accessibilityRole="button" accessibilityLabel={`Sign ${mode === 'signup' ? 'up' : 'in'} with ${provider[0].toUpperCase()}${provider.slice(1)}`}
            aria-busy={busy === provider} disabled={disabled}
            style={({ pressed }) => [styles.social, pressed && styles.pressed, disabled && styles.disabled]}
            onPress={() => onSelect(provider)}>
            {busy === provider ? <ActivityIndicator color={colors.primary} /> : provider === 'google' ? (
              <Image source={require('../../../assets/images/google-logo.png')} style={styles.google} accessibilityIgnoresInvertColors />
            ) : <FontAwesome name={provider === 'apple' ? 'apple' : 'facebook'} size={27} color={provider === 'apple' ? '#000000' : '#3769D2'} />}
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 46, paddingHorizontal: 36 },
  line: { flex: 1, height: 1, backgroundColor: '#E3E3E3' },
  dividerText: { fontFamily: typography.body, fontSize: 14, color: colors.textMuted },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 36 },
  social: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: '#E6E6E6', alignItems: 'center', justifyContent: 'center' },
  google: { width: 27, height: 28, resizeMode: 'contain' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
