// Shapes shared by the profile screen and the API client. The API (flower-api) is the
// source of truth: it validates every request again and stores the profile in Neon.
export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
};

/** What the server returns for a saved profile. */
export type Profile = {
  name: string;
  countryIso: string;
  phoneNational: string;
  phoneE164: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
};

/** What the form sends. The phone is typed without the country code; the server normalizes it. */
export type ProfileInput = { name: string; countryIso: string; phone: string; gender: Gender };
