import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/ui/AuthField';
import { BackButton } from '@/components/ui/BackButton';
import { colors, typography } from '@/theme';
import { authErrorMessage } from './auth-errors';
import { isValidEmail } from './password-reset-actions';

type Props = {
  sendCode?: (email: string) => Promise<void>;
  ready?: boolean;
  isSignedIn?: boolean;
  onBack: () => void;
  /** Called once Clerk has emailed the code. */
  onSent: () => void;
};

// Layout provisional: no reference design has been supplied for this screen yet.
export function ForgotPasswordForm({ sendCode, ready = true, isSignedIn = false, onBack, onSent }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const locked = busy || isSignedIn || !ready;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function submit() {
    if (submitting.current || locked) return;
    setNotice('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    if (!sendCode) {
      setNotice('Password reset is not available yet. Please try again once authentication is connected.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      await sendCode(email);
      if (mounted.current) onSent();
    } catch (cause) {
      if (mounted.current) setNotice(authErrorMessage(cause));
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <BackButton label="Back to Sign In" disabled={busy} onPress={onBack} />
            <Text accessibilityRole="header" style={styles.heading}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter the email linked to your account and we’ll send you a code to reset your password.</Text>
            <View style={styles.form}>
              <AuthField label="Email" value={email} error={error} onChangeText={setEmail} placeholder="example@gmail.com"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
                editable={!locked} returnKeyType="go" onSubmitEditing={() => void submit()} />
            </View>
            {(notice || isSignedIn) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>
              {isSignedIn ? 'You’re already signed in. Sign out to reset your password.' : notice}
            </Text>}
            <Pressable accessibilityRole="button" accessibilityLabel="Send Code" aria-busy={busy} disabled={locked}
              style={({ pressed }) => [styles.submit, pressed && styles.pressed, locked && styles.disabled]} onPress={() => void submit()}>
              {busy ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitText}>Send Code</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 58 : 20, paddingBottom: 36 },
  content: { width: '100%', maxWidth: 440 },
  heading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 36, textAlign: 'center', color: colors.text, marginTop: 36 },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 18, textAlign: 'center', color: colors.textMuted, marginTop: 2 },
  form: { marginTop: 40 },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 16 },
  submit: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 34 },
  submitText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
