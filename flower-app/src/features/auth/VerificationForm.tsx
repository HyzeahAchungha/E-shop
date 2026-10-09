import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';
import { signupErrorMessage } from './useSignup';
import type { VerificationResult } from './verification-actions';
import { CODE_LENGTH, resendSecondsRemaining, updateCodeDigits } from './verification-utils';

type Props = {
  email?: string;
  sentAt?: number;
  ready?: boolean;
  hasAttempt?: boolean;
  canResend?: boolean;
  isSignedIn?: boolean;
  verify?: (code: string) => Promise<VerificationResult>;
  resend?: () => Promise<void>;
  onBack: () => void;
};

export function VerificationForm({ email, sentAt = 0, ready = true, hasAttempt = false, canResend = false,
  isSignedIn = false, verify, resend, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focused, setFocused] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'verify' | 'resend' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [now, setNow] = useState(Date.now);
  const inputs = useRef<(TextInput | null)[]>([]);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const remaining = resendSecondsRemaining(sentAt, now);
  const done = completed || isSignedIn;
  const locked = busy !== null || done || !ready;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = sentAt ? setInterval(update, 1000) : undefined;
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') update(); });
    return () => { if (timer) clearInterval(timer); subscription.remove(); };
  }, [sentAt]);

  function changeDigit(index: number, text: string) {
    const next = updateCodeDigits(digits, index, text);
    setDigits(next.digits);
    setError('');
    inputs.current[next.focus]?.focus();
  }

  async function submit() {
    if (inFlight.current || locked) return;
    setNotice('');
    if (digits.some((digit) => !digit)) {
      setError('Please enter the complete six-digit code.');
      inputs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }
    if (!hasAttempt || !verify) {
      setError('Return to signup to request a verification code.');
      return;
    }
    inFlight.current = true;
    setBusy('verify');
    setError('');
    Keyboard.dismiss();
    try {
      const result = await verify(digits.join(''));
      if (!mounted.current) return;
      if (result.kind === 'authenticated') {
        setDigits(Array(CODE_LENGTH).fill(''));
        setCompleted(true);
      } else {
        setNotice(result.message);
      }
    } catch (cause) {
      if (mounted.current) setError(signupErrorMessage(cause));
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  async function resendCode() {
    if (inFlight.current || locked || !canResend || !resend || resendSecondsRemaining(sentAt) > 0) return;
    inFlight.current = true;
    setBusy('resend');
    setError('');
    setNotice('');
    try {
      await resend();
      if (mounted.current) {
        setDigits(Array(CODE_LENGTH).fill(''));
        setNotice('A new verification code has been sent.');
        inputs.current[0]?.focus();
      }
    } catch (cause) {
      if (mounted.current) setError(signupErrorMessage(cause));
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back to signup" disabled={busy !== null}
              style={({ pressed }) => [styles.back, pressed && styles.pressed, busy !== null && styles.disabled]} onPress={onBack}>
              <Feather name="arrow-left" size={23} color={colors.text} />
            </Pressable>
            <Text accessibilityRole="header" style={styles.heading}>Verify Code</Text>
            <Text style={styles.subtitle}>{email ? 'Please enter the code we just sent to email' : 'Sign up to receive your verification code.'}</Text>
            {Boolean(email) && <Text style={styles.email}>{email}</Text>}

            <View style={styles.codeRow}>
              {digits.map((digit, index) => (
                <TextInput key={index} ref={(input) => { inputs.current[index] = input; }} accessibilityLabel={`Code digit ${index + 1} of ${CODE_LENGTH}`}
                  style={[styles.codeBox, focused === index && styles.focused, Boolean(error) && styles.invalid]}
                  value={digit} onChangeText={(text) => changeDigit(index, text)} onFocus={() => setFocused(index)} onBlur={() => setFocused(null)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
                      setDigits((previous) => previous.map((value, position) => position === index - 1 ? '' : value));
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                  placeholder="-" placeholderTextColor={colors.textMuted} keyboardType="number-pad" inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'} textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                  autoCapitalize="none" autoCorrect={false} maxLength={CODE_LENGTH} selectTextOnFocus editable={!locked}
                  returnKeyType="done" />
              ))}
            </View>
            {Boolean(error) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
            {(notice || done) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>
              {completed ? 'Your email is verified and you’re signed in. Your next screen is coming soon.'
                : isSignedIn ? 'You’re already signed in. Your next screen is coming soon.' : notice}
            </Text>}
            <View style={styles.resendArea}>
              <Text style={styles.resendPrompt}>Didn’t receive OTP?</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Resend code" aria-busy={busy === 'resend'}
                disabled={locked || !canResend || remaining > 0} onPress={() => void resendCode()}
                style={({ pressed }) => [styles.resendButton, pressed && styles.pressed]}>
                {busy === 'resend' ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.resendText, (locked || !canResend || remaining > 0) && styles.resendDisabled]}>
                  {remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
                </Text>}
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Verify" aria-busy={busy === 'verify'} disabled={locked}
              style={({ pressed }) => [styles.verify, pressed && styles.pressed, locked && styles.disabled]} onPress={() => void submit()}>
              {busy === 'verify' ? <ActivityIndicator color={colors.background} /> : <Text style={styles.verifyText}>Verify</Text>}
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
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#E6E6E6', alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 36, textAlign: 'center', color: colors.text, marginTop: 36 },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 18, textAlign: 'center', color: colors.textMuted, marginTop: 0 },
  email: { fontFamily: typography.brand, fontSize: 14, lineHeight: 20, textAlign: 'center', color: colors.primary },
  codeRow: { flexDirection: 'row', gap: 8, marginTop: 30, paddingHorizontal: 4 },
  codeBox: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 0, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: 'transparent', color: colors.text, fontFamily: typography.body, fontSize: 18, textAlign: 'center' },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: '#B42318' },
  error: { fontFamily: typography.body, fontSize: 13, lineHeight: 20, color: '#B42318', marginTop: 14, textAlign: 'center' },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', padding: 12, borderRadius: 10, marginTop: 14, textAlign: 'center' },
  resendArea: { alignItems: 'center', marginTop: 32 },
  resendPrompt: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  resendButton: { minHeight: 44, minWidth: 140, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 3 },
  resendText: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.text, textDecorationLine: 'underline', textAlign: 'center' },
  resendDisabled: { color: colors.textMuted },
  verify: { minHeight: 56, borderRadius: 32, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  verifyText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
