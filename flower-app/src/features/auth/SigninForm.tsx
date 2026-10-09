import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/ui/AuthField';
import { AuthSocialSection } from '@/components/ui/AuthSocialSection';
import { colors, typography } from '@/theme';
import { authErrorMessage } from './auth-errors';
import type { SigninResult, SigninValues } from './signin-actions';
import type { SocialProvider } from './signup-actions';

type Props = {
  login?: (values: SigninValues) => Promise<SigninResult>;
  loginSocial?: (provider: SocialProvider) => Promise<SigninResult>;
  ready?: boolean;
  isSignedIn?: boolean;
  onSignUp: () => void;
};

export function SigninForm({ login, loginSocial, ready = true, isSignedIn = false, onSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SigninValues, string>>>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'email' | SocialProvider | null>(null);
  const [finished, setFinished] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const passwordInput = useRef<TextInput>(null);
  const locked = busy !== null || finished || isSignedIn || !ready;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function submit(provider?: SocialProvider) {
    if (submitting.current || locked) return;
    const nextErrors: typeof errors = {};
    if (!provider) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Please enter a valid email address.';
      if (!password) nextErrors.password = 'Please enter your password.';
    }
    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length) return;
    if (!login || !loginSocial) {
      setNotice('Sign in is not available yet. Please try again once authentication is connected.');
      return;
    }
    submitting.current = true;
    setBusy(provider ?? 'email');
    Keyboard.dismiss();
    try {
      const result = provider ? await loginSocial(provider) : await login({ email, password });
      if (!mounted.current) return;
      if (result.kind === 'authenticated') {
        setPassword('');
        setFinished(true);
      } else if (result.kind === 'incomplete') {
        setNotice(result.message);
      }
    } catch (error) {
      if (mounted.current) setNotice(authErrorMessage(error));
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.heading}>Sign In</Text>
            <Text style={styles.subtitle}>Hi! Welcome back, you’ve been missed</Text>
            <View style={styles.form}>
              <AuthField label="Email" value={email} error={errors.email} onChangeText={setEmail} placeholder="example@gmail.com"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
                editable={!locked} returnKeyType="next" onSubmitEditing={() => passwordInput.current?.focus()} />
              <AuthField ref={passwordInput} label="Password" isPassword value={password} error={errors.password} onChangeText={setPassword}
                placeholder="****************" autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
                editable={!locked} returnKeyType="go" onSubmitEditing={() => void submit()} />
            </View>
            <View style={styles.forgotRow}>
              <Pressable accessibilityRole="button" accessibilityLabel="Forgot Password" disabled={busy !== null}
                onPress={() => setNotice('Password recovery will be available when its screen is added.')}>
                <Text style={styles.link}>Forgot Password?</Text>
              </Pressable>
            </View>
            {(notice || finished || isSignedIn) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>
              {finished ? 'You’re signed in. Your next screen is coming soon.'
                : isSignedIn ? 'You’re already signed in. Your next screen is coming soon.' : notice}
            </Text>}
            <Pressable accessibilityRole="button" accessibilityLabel="Sign In" aria-busy={busy === 'email'} disabled={locked}
              style={({ pressed }) => [styles.signin, pressed && styles.pressed, locked && styles.disabled]} onPress={() => void submit()}>
              {busy === 'email' ? <ActivityIndicator color={colors.background} /> : <Text style={styles.signinText}>Sign In</Text>}
            </Pressable>
            <AuthSocialSection mode="signin" disabled={locked} busy={busy && busy !== 'email' ? busy : null}
              onSelect={(provider) => void submit(provider)} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Sign Up" disabled={busy !== null}
                onPress={() => { setPassword(''); onSignUp(); }}><Text style={styles.link}>Sign Up</Text></Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 122 : 84, paddingBottom: 36 },
  content: { width: '100%', maxWidth: 440 },
  heading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 35, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: 'center', marginTop: 18, marginBottom: 52 },
  form: { gap: 10 },
  forgotRow: { alignItems: 'flex-end', minHeight: 44, justifyContent: 'center' },
  link: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.primary, textDecorationLine: 'underline', paddingVertical: 10 },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 12 },
  signin: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  signinText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 24 },
  footerText: { fontFamily: typography.body, fontSize: 14, color: colors.text },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
