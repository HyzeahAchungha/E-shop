// Server-side rules for the profile. The mobile app has a matching copy for instant
// feedback (flower-app/src/features/profile/profile-validation.ts); the server never
// trusts it, and tests/parity.test.mjs keeps both on the same rules.
// Phone numbers are checked with libphonenumber-js, which knows each country's real
// number lengths and national prefixes (for example, the leading 0 that is dropped in
// the UK but is part of the number in Côte d'Ivoire).
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import type { CountryCode } from 'libphonenumber-js/min';

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export const NAME_MIN = 2;
export const NAME_MAX = 80;
const PHONE_INPUT_MAX = 30;

export type ProfileValues = { name: string; countryIso: string; phoneNational: string; phoneE164: string; gender: Gender };
export type ProfileErrors = Partial<Record<'name' | 'phone' | 'country' | 'gender', string>>;
export type ProfileValidation = { ok: true; value: ProfileValues } | { ok: false; errors: ProfileErrors };

const COUNTRY_CODES: ReadonlySet<string> = new Set(getCountries());

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateProfile(input: unknown): ProfileValidation {
  const errors: ProfileErrors = {};
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  const name = typeof body.name === 'string' ? normalizeName(body.name) : '';
  if (name.length < NAME_MIN || !/\p{L}/u.test(name)) errors.name = `Enter your name (at least ${NAME_MIN} characters).`;
  else if (name.length > NAME_MAX) errors.name = `Your name must be ${NAME_MAX} characters or fewer.`;

  const countryIso = typeof body.countryIso === 'string' ? body.countryIso.toUpperCase() : '';
  if (!COUNTRY_CODES.has(countryIso)) errors.country = 'Choose your country code.';

  const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
  let phoneNational = '';
  let phoneE164 = '';
  if (!rawPhone) errors.phone = 'Enter your phone number.';
  else if (rawPhone.startsWith('+')) errors.phone = 'Enter your number without the country code.';
  else if (rawPhone.length > PHONE_INPUT_MAX || !/^[\d\s\-().]+$/.test(rawPhone)) errors.phone = 'Use digits only, without the country code.';
  else if (!errors.country) {
    const parsed = parsePhoneNumberFromString(rawPhone, countryIso as CountryCode);
    // The number must belong to the chosen calling code (+1 is shared by several countries).
    if (!parsed || !parsed.isValid() || parsed.countryCallingCode !== getCountryCallingCode(countryIso as CountryCode)) {
      errors.phone = 'Enter a valid phone number.';
    } else {
      phoneNational = parsed.nationalNumber;
      phoneE164 = parsed.number;
    }
  }

  const gender = GENDERS.find((option) => option === body.gender);
  if (!gender) errors.gender = 'Select your gender.';

  if (Object.keys(errors).length || !gender) return { ok: false, errors };
  return { ok: true, value: { name, countryIso, phoneNational, phoneE164, gender } };
}
