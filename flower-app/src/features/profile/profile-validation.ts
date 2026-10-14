// Instant feedback for the Complete Profile form. This is a copy of the rules in
// flower-api/src/profile-validation.ts: the server never trusts it and validates again, and
// flower-api/tests/parity.test.mjs fails if the two copies ever disagree.
// It imports nothing from the app so the same file can be tested directly in Node.
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import type { CountryCode } from 'libphonenumber-js/min';

export const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
type GenderValue = (typeof GENDER_VALUES)[number];

export const NAME_MIN = 2;
export const NAME_MAX = 80;
const PHONE_INPUT_MAX = 30;

export type ProfileFormValues = { name: string; countryIso: string; phone: string; gender: GenderValue | null };
export type ProfileFormErrors = Partial<Record<'name' | 'phone' | 'country' | 'gender', string>>;
export type ProfileFormResult =
  | { ok: true; value: { name: string; countryIso: string; phone: string; gender: GenderValue } }
  | { ok: false; errors: ProfileFormErrors };

const COUNTRY_CODES: ReadonlySet<string> = new Set(getCountries());

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateProfileForm(input: ProfileFormValues): ProfileFormResult {
  const errors: ProfileFormErrors = {};

  const name = normalizeName(input.name);
  if (name.length < NAME_MIN || !/\p{L}/u.test(name)) errors.name = `Enter your name (at least ${NAME_MIN} characters).`;
  else if (name.length > NAME_MAX) errors.name = `Your name must be ${NAME_MAX} characters or fewer.`;

  const countryIso = input.countryIso.toUpperCase();
  if (!COUNTRY_CODES.has(countryIso)) errors.country = 'Choose your country code.';

  const phone = input.phone.trim();
  if (!phone) errors.phone = 'Enter your phone number.';
  else if (phone.startsWith('+')) errors.phone = 'Enter your number without the country code.';
  else if (phone.length > PHONE_INPUT_MAX || !/^[\d\s\-().]+$/.test(phone)) errors.phone = 'Use digits only, without the country code.';
  else if (!errors.country) {
    const parsed = parsePhoneNumberFromString(phone, countryIso as CountryCode);
    if (!parsed || !parsed.isValid() || parsed.countryCallingCode !== getCountryCallingCode(countryIso as CountryCode)) {
      errors.phone = 'Enter a valid phone number.';
    }
  }

  const gender = GENDER_VALUES.find((option) => option === input.gender);
  if (!gender) errors.gender = 'Select your gender.';

  if (Object.keys(errors).length || !gender) return { ok: false, errors };
  return { ok: true, value: { name, countryIso, phone, gender } };
}
