import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/ui/AuthField';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { PhoneField } from '@/components/ui/PhoneField';
import { SelectField } from '@/components/ui/SelectField';
import { ApiError } from '@/lib/api-client';
import { colors, typography } from '@/theme';
import { GENDERS, GENDER_LABELS, type Gender, type Profile, type ProfileInput } from '@/types/profile';
import { defaultCountryIso } from './countries';
import type { PickedAvatar } from './pick-avatar';
import { profileErrorMessage } from './profile-errors';
import { validateProfileForm, type ProfileFormErrors } from './profile-validation';
import type { CompleteProfileStatus } from './useCompleteProfile';

const GENDER_OPTIONS = GENDERS.map((value) => ({ value, label: GENDER_LABELS[value] }));
const FIELD_KEYS: (keyof ProfileFormErrors)[] = ['name', 'phone', 'country', 'gender'];

type Props = {
  status?: CompleteProfileStatus;
  initialName?: string;
  /** A photo the user already has in Clerk. It counts as their profile photo. */
  initialPhotoUri?: string | null;
  pickAvatar?: () => Promise<PickedAvatar | null>;
  submit?: (input: ProfileInput, avatarDataUri: string | null) => Promise<Profile>;
  retry?: () => void;
  onSignIn: () => void;
};

function deviceCountry(): string {
  try {
    return defaultCountryIso(Intl.NumberFormat().resolvedOptions().locale);
  } catch {
    return defaultCountryIso();
  }
}

export function CompleteProfileForm({ status = 'form', initialName = '', initialPhotoUri = null, pickAvatar, submit, retry, onSignIn }: Props) {
  const blockBack = status === 'form' || status === 'complete';

  // There is no back arrow on this screen, so Android's system Back must not leave it either.
  useEffect(() => {
    if (!blockBack) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [blockBack]);

  return (
    <SafeAreaView style={styles.screen}>
      {status === 'form' ? <FormBody initialName={initialName} initialPhotoUri={initialPhotoUri} pickAvatar={pickAvatar} submit={submit} />
        : <Message status={status} retry={retry} onSignIn={onSignIn} />}
    </SafeAreaView>
  );
}

function Message({ status, retry, onSignIn }: { status: CompleteProfileStatus; retry?: () => void; onSignIn: () => void }) {
  return (
    <View style={styles.message}>
      {status === 'loading' && <>
        <ActivityIndicator color={colors.primary} />
        <Text accessibilityLiveRegion="polite" style={styles.messageText}>Loading your profile…</Text>
      </>}
      {status === 'signed-out' && <>
        <Text accessibilityRole="header" style={styles.messageHeading}>Complete Your Profile</Text>
        <Text style={styles.messageText}>Sign in to complete your profile.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Go to Sign In" onPress={onSignIn} style={styles.linkButton}>
          <Text style={styles.link}>Go to Sign In</Text>
        </Pressable>
      </>}
      {status === 'load-error' && <>
        <Text accessibilityRole="header" style={styles.messageHeading}>Complete Your Profile</Text>
        <Text accessibilityRole="alert" style={styles.messageText}>We could not check your profile. Check your connection and try again.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Try again" onPress={retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </>}
      {status === 'complete' && <>
        <Text accessibilityRole="header" style={styles.messageHeading}>You’re all set</Text>
        <Text style={styles.messageText}>Your profile is already complete. Your next screen is coming soon.</Text>
      </>}
    </View>
  );
}

function FormBody({ initialName, initialPhotoUri, pickAvatar, submit }: Pick<Props, 'initialName' | 'initialPhotoUri' | 'pickAvatar' | 'submit'>) {
  const [name, setName] = useState(initialName ?? '');
  const [countryIso, setCountryIso] = useState(deviceCountry);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [avatar, setAvatar] = useState<PickedAvatar | null>(null);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [photoError, setPhotoError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'save' | 'photo' | null>(null);
  const [saved, setSaved] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const phoneInput = useRef<TextInput>(null);
  const locked = busy !== null || saved;
  // The photo is required: one picked now, or one the account already has.
  const photoUri = avatar?.uri ?? initialPhotoUri ?? null;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function choosePhoto() {
    if (inFlight.current || locked) return;
    if (!pickAvatar) {
      setNotice('Choosing a photo is not available here.');
      return;
    }
    inFlight.current = true;
    setBusy('photo');
    setNotice('');
    try {
      const picked = await pickAvatar();
      if (mounted.current && picked) {
        setAvatar(picked);
        setPhotoError('');
      }
    } catch (error) {
      // The picker's own messages are written for users ("That photo is too large…").
      if (mounted.current) setNotice(error instanceof Error ? error.message : 'We could not open your photos.');
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  async function save() {
    if (inFlight.current || locked) return;
    setNotice('');
    const result = validateProfileForm({ name, countryIso, phone, gender });
    setErrors(result.ok ? {} : result.errors);
    setPhotoError(photoUri ? '' : 'Add a profile photo.');
    if (!result.ok || !photoUri) return;
    if (!submit) {
      setNotice('Saving your profile is not available yet. Please try again once authentication is connected.');
      return;
    }
    inFlight.current = true;
    setBusy('save');
    Keyboard.dismiss();
    try {
      await submit(result.value, avatar?.dataUri ?? null);
      if (mounted.current) setSaved(true);
    } catch (error) {
      if (!mounted.current) return;
      if (error instanceof ApiError && error.code === 'validation') {
        // The server found something the app's own check allowed; show its message on the right field.
        const fromServer: ProfileFormErrors = {};
        for (const key of FIELD_KEYS) if (error.fields[key]) fromServer[key] = error.fields[key];
        setErrors(fromServer);
        setPhotoError(error.fields.photo ?? '');
      }
      setNotice(profileErrorMessage(error));
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.heading}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Don’t worry, only you can see your personal data. No one else will be able to see it.</Text>

          <View style={styles.avatar}>
            <AvatarPicker uri={photoUri} busy={busy === 'photo'} disabled={locked} onPress={() => void choosePhoto()} />
            {Boolean(photoError) && <Text accessibilityRole="alert" style={styles.photoError}>{photoError}</Text>}
          </View>

          <View style={styles.form}>
            <AuthField label="Name" value={name} error={errors.name} onChangeText={setName} placeholder="Ex. John Doe"
              autoCapitalize="words" autoCorrect={false} autoComplete="name" textContentType="name" editable={!locked}
              returnKeyType="next" onSubmitEditing={() => phoneInput.current?.focus()} />
            <PhoneField ref={phoneInput} label="Phone Number" countryIso={countryIso} onCountryChange={setCountryIso} value={phone}
              onChangeText={setPhone} error={errors.phone ?? errors.country} editable={!locked} returnKeyType="done" />
            <SelectField label="Gender" options={GENDER_OPTIONS} value={gender} error={errors.gender} disabled={locked}
              onChange={(value) => setGender(value as Gender)} />
          </View>

          {(notice || saved) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.notice}>
            {saved ? 'Your profile is saved. Your next screen is coming soon.' : notice}
          </Text>}

          <Pressable accessibilityRole="button" accessibilityLabel="Complete Profile" aria-busy={busy === 'save'} disabled={locked}
            style={({ pressed }) => [styles.submit, pressed && styles.pressed, locked && styles.disabled]} onPress={() => void save()}>
            {busy === 'save' ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitText}>Complete Profile</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 58 : 20, paddingBottom: 36 },
  content: { width: '100%', maxWidth: 440 },
  // The reference has a back arrow here; it was removed, so its 44px of space keeps the heading where it was designed.
  heading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 36, textAlign: 'center', color: colors.text, marginTop: 80 },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 18, textAlign: 'center', color: colors.textMuted, marginTop: 2, maxWidth: 300, alignSelf: 'center' },
  avatar: { marginTop: 34 },
  photoError: { color: '#B42318', fontFamily: typography.body, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 10 },
  form: { gap: 20, marginTop: 32 },
  notice: { fontFamily: typography.body, fontSize: 14, lineHeight: 21, color: colors.primary, backgroundColor: '#F7F0FC', borderRadius: 10, padding: 12, marginTop: 16 },
  submit: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 34 },
  submitText: { fontFamily: typography.brand, fontSize: 18, lineHeight: 26, color: colors.background, textAlign: 'center' },
  messageHeading: { fontFamily: typography.brand, fontSize: 27, lineHeight: 36, textAlign: 'center', color: colors.text },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  messageText: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center', maxWidth: 320 },
  button: { minHeight: 52, paddingHorizontal: 32, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { fontFamily: typography.brand, fontSize: 17, color: colors.background },
  linkButton: { minHeight: 44, justifyContent: 'center' },
  link: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.primary, textDecorationLine: 'underline' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
