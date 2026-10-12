import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/ui/AuthField';
import { BackButton } from '@/components/ui/BackButton';
import { colors, typography } from '@/theme';
import { authErrorMessage } from './auth-errors';
import { MIN_PASSWORD_LENGTH, type NewPasswordResult } from './password-reset-actions';

type Props = {
  submit?: (password: string) => Promise<NewPasswordResult>;
  ready?: boolean;
  hasPendingReset?: boolean;
  /** Cancels the reset and returns to Sign In. */
  onBack: () => void;
  /** Called once the password was changed: shows the success message on Sign In. */
  onDone: () => void;
  /** Opens Forgot Password when no verified reset is waiting. */
  onRestart: () => void;
};

export function NewPasswordForm({ submit, ready = true, hasPendingReset = false, onBack, onDone, onRestart }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wasPending, setWasPending] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const confirmInput = useRef<TextInput>(null);
  const locked = busy || finished || !ready;
  // Clerk moves the attempt on while saving, so only an attempt that never was pending is "missing".
  const missingReset = ready && !hasPendingReset && !wasPending && !finished;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Remember that a verified reset existed (React's "derive state while rendering" pattern).
  if (hasPendingReset && !wasPending) setWasPending(true);

  // Android's system Back follows the same rule as the arrow: cancel and return to Sign In.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!submitting.current) onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  async function save() {
    if (submitting.current || locked) return;
    const nextErrors: typeof errors = {};
    if (password.length < MIN_PASSWORD_LENGTH) nextErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!confirm) nextErrors.confirm = 'Please confirm your new password.';
    else if (confirm !== password) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length) return;
    if (!submit) {
      setNotice('Password reset is not available yet. Please try again once authentication is connected.');
      return;
    }
    if (!hasPendingReset) return; // The prompt above already explains how to start.
    submitting.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      const result = await submit(password);
      if (!mounted.current) return;
      if (result.kind === 'reset') {
        setPassword('');
        setConfirm('');
        setFinished(true);
        onDone();
      } else {
        setNotice(result.message);
      }
    } catch (error) {
      if (mounted.current) setNotice(authErrorMessage(error));
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
            <BackButton label="Cancel password reset and go to Sign In" disabled={busy} onPress={onBack} />
            <Text accessibilityRole="header" style={styles.heading}>New Password</Text>
            <Text style={styles.subtitle}>Your new password must be different from previously used passwords.</Text>
            {missingReset && <View style={styles.prompt}>
              <Text accessibilityRole="alert" style={styles.promptText}>Request a reset code first to choose a new password.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Go to Forgot Password" onPress={onRestart}>
                <Text style={styles.link}>Go to Forgot Password</Text>
              </Pressable>
            </View>}
            <View style={styles.form}>
              <AuthField label="Password" isPassword value={password} error={errors.password} onChangeText={setPassword}
                placeholder="****************" autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
                editable={!locked} returnKeyType="next" onSubmitEditing={() => confirmInput.current?.focus()} />
              <AuthField ref={confirmInput} label="Confirm Password" isPassword value={confirm} error={errors.confirm} onChangeText={setConfirm}
                placeholder="****************" autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
                editable={!locked} returnKeyType="go" onSubmitEditing={() => void save()} />
            </View>
            {Boolean(notice) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel="Create New Password" aria-busy={busy} disabled={locked}
              style={({ pressed }) => [styles.submit, pressed && styles.pressed, locked && styles.disabled]} onPress={() => void save()}>
              {busy ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitText}>Create New Password</Text>}
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
  // Narrow enough to break after "different", as in the reference.
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 18, textAlign: 'center', color: colors.textMuted, marginTop: 2, maxWidth: 260, alignSelf: 'center' },
  prompt: { backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 20, alignItems: 'center' },
  promptText: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, textAlign: 'center' },
  link: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.primary, textDecorationLine: 'underline', paddingVertical: 10 },
  form: { gap: 20, marginTop: 40 },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 16 },
  submit: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 34 },
  submitText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
