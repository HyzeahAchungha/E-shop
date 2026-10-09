import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/ui/AuthField';
import { AuthSocialSection } from '@/components/ui/AuthSocialSection';
import { colors, typography } from '@/theme';
import { signupErrorMessage, type SignupResult, type SignupValues, type SocialProvider } from './useSignup';

type Props = {
  register?: (values: SignupValues) => Promise<SignupResult>;
  registerSocial?: (provider: SocialProvider) => Promise<SignupResult>;
  ready?: boolean;
  isSignedIn?: boolean;
  awaitingCode?: boolean;
  verificationEmail?: string;
  onVerification?: () => void;
  onSignIn?: () => void;
};
type Errors = Partial<Record<keyof SignupValues | 'terms', string>>;

export function SignupForm({ register, registerSocial, ready = true, isSignedIn = false, awaitingCode = false, verificationEmail, onVerification, onSignIn }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'email' | SocialProvider | null>(null);
  const [finished, setFinished] = useState(false);
  const submitting = useRef(false);
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const locked = busy !== null || finished || isSignedIn;
  const fieldsLocked = locked || awaitingCode || Boolean(verificationEmail);

  async function submit(provider?: SocialProvider) {
    if (submitting.current || finished || isSignedIn) return;
    if (verificationEmail && onVerification) {
      onVerification();
      return;
    }
    const nextErrors: Errors = {};
    if (!provider && !awaitingCode) {
      if (!name.trim()) nextErrors.name = 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Please enter a valid email address.';
      if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    }
    if (!agreed) nextErrors.terms = 'Please agree to the Terms & Condition to continue.';
    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length) return;
    if (!register || !registerSocial) {
      setNotice('Account creation is not available yet. Please try again once signup is connected.');
      return;
    }
    if (!ready) {
      setNotice('Signup is still loading. Please try again in a moment.');
      return;
    }
    submitting.current = true;
    setBusy(provider ?? 'email');
    Keyboard.dismiss();
    try {
      const result = provider ? await registerSocial(provider) : await register({ name, email, password });
      if (result.kind === 'verification') {
        setPassword('');
        onVerification?.();
      } else if (result.kind === 'authenticated') {
        setPassword('');
        setFinished(true);
        setNotice('You’re signed in. Your next screen is coming soon.');
      } else if (result.kind === 'incomplete') {
        setNotice(result.message);
      }
    } catch (error) {
      setNotice(signupErrorMessage(error));
    } finally {
      submitting.current = false;
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.heading}>Create Account</Text>
            <Text style={styles.subtitle}>Fill your information below or register{ '\n' }with your social account.</Text>

            <View style={styles.form}>
              <AuthField label="Name" value={name} error={errors.name} onChangeText={setName} placeholder="Ex. John Doe"
                autoCapitalize="words" autoComplete="name" textContentType="name" editable={!fieldsLocked}
                returnKeyType="next" onSubmitEditing={() => emailInput.current?.focus()} />
              <AuthField ref={emailInput} label="Email" value={email} error={errors.email} onChangeText={setEmail} placeholder="example@gmail.com"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
                textContentType="emailAddress" editable={!fieldsLocked} returnKeyType="next" onSubmitEditing={() => passwordInput.current?.focus()} />
              <AuthField ref={passwordInput} label="Password" isPassword value={password} error={errors.password} onChangeText={setPassword}
                placeholder="****************" autoCapitalize="none" autoCorrect={false} autoComplete="new-password"
                textContentType="newPassword" editable={!fieldsLocked} returnKeyType="done" onSubmitEditing={() => void submit()} />
            </View>

            <View style={styles.termsRow}>
              <Pressable hitSlop={5} accessibilityRole="checkbox" accessibilityLabel="Agree to Terms & Condition" aria-checked={agreed} aria-disabled={locked || awaitingCode || Boolean(verificationEmail)} accessibilityState={{ checked: agreed, disabled: locked || awaitingCode || Boolean(verificationEmail) }}
                disabled={locked || awaitingCode || Boolean(verificationEmail)} onPress={() => setAgreed(!agreed)} style={styles.checkboxTouch}>
                <View style={[styles.checkbox, agreed && styles.checked]}>
                  {agreed && <Feather name="check" size={18} color={colors.background} />}
                </View>
              </Pressable>
              <Text style={styles.termsText}>Agree with </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Read Terms & Condition" onPress={() => setNotice('Terms & Condition content will be added soon.')}>
                <Text style={styles.link}>Terms &amp; Condition</Text>
              </Pressable>
            </View>
            {errors.terms && <Text accessibilityRole="alert" style={styles.error}>{errors.terms}</Text>}
            {(notice || isSignedIn) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>
              {isSignedIn ? 'You’re signed in. Your next screen is coming soon.' : notice}
            </Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={verificationEmail ? 'Continue to verification' : awaitingCode && !finished ? 'Retry sending code' : 'Sign Up'}
              aria-busy={busy === 'email'} accessibilityState={{ disabled: locked || !ready, busy: busy === 'email' }} disabled={locked || !ready}
              style={({ pressed }) => [styles.signup, pressed && styles.pressed, (locked || !ready) && styles.disabled]}
              onPress={() => void submit()}>
              {busy === 'email' ? <ActivityIndicator color="white" /> : <Text style={styles.signupText}>{verificationEmail ? 'Continue to verification' : awaitingCode && !finished ? 'Retry sending code' : 'Sign Up'}</Text>}
            </Pressable>

            <AuthSocialSection mode="signup" disabled={locked || !ready || awaitingCode || Boolean(verificationEmail)}
              busy={busy && busy !== 'email' ? busy : null} onSelect={(provider) => void submit(provider)} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Sign In" disabled={busy !== null} onPress={onSignIn}>
                <Text style={styles.link}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 72 : 38, paddingBottom: 36 },
  content: { width: '100%', maxWidth: 440 },
  heading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 35, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: 'center', marginTop: 18, marginBottom: 28 },
  form: { gap: 22 },
  error: { color: '#B42318', fontFamily: typography.body, fontSize: 13, lineHeight: 19 },
  termsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
  checkboxTouch: { width: 34, minHeight: 44, justifyContent: 'center' },
  checkbox: { width: 23, height: 23, borderRadius: 5, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primary },
  termsText: { fontFamily: typography.body, fontSize: 15, color: colors.text },
  link: { fontFamily: typography.body, fontSize: 15, color: colors.primary, textDecorationLine: 'underline', paddingVertical: 10 },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 12 },
  signup: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 26 },
  signupText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 30 },
  footerText: { fontFamily: typography.body, fontSize: 14, color: colors.text },
});
