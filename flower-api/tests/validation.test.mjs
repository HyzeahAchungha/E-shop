import assert from 'node:assert/strict';
import test from 'node:test';
import { validateProfile } from '../src/profile-validation.ts';

const base = { name: 'Jane Doe', countryIso: 'CM', phone: '6 71 23 45 67', gender: 'female' };
const errorsOf = (input) => {
  const result = validateProfile(input);
  assert.equal(result.ok, false);
  return result.errors;
};

test('a complete profile is accepted and returns the normalized values', () => {
  const result = validateProfile(base);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { name: 'Jane Doe', countryIso: 'CM', phoneNational: '671234567', phoneE164: '+237671234567', gender: 'female' });
});
test('names are trimmed and inner spaces collapsed', () => {
  assert.equal(validateProfile({ ...base, name: '   Jane    Mary   Doe ' }).value.name, 'Jane Mary Doe');
});
test('names must contain a letter and have a sensible length', () => {
  for (const name of ['', ' ', 'J', '1234', '--', undefined, 42, null, {}]) assert.ok(errorsOf({ ...base, name }).name, String(name));
  assert.ok(errorsOf({ ...base, name: 'a'.repeat(81) }).name);
  assert.equal(validateProfile({ ...base, name: 'Zoë Ngô' }).ok, true);
  assert.equal(validateProfile({ ...base, name: '李小龍' }).ok, true);
});
test('the country must be a real ISO code, in any letter case', () => {
  for (const countryIso of ['', 'ZZ', 'CMR', 'c', '12', undefined, 7]) assert.ok(errorsOf({ ...base, countryIso }).country, String(countryIso));
  assert.equal(validateProfile({ ...base, countryIso: 'cm' }).value.countryIso, 'CM');
});
test('phone numbers are checked against the chosen country, not just their length', () => {
  const valid = [['CM', '671234567', '+237671234567'], ['US', '(415) 555-2671', '+14155552671'], ['GB', '07911 123456', '+447911123456'],
    ['NG', '0803 123 4567', '+2348031234567'], ['FR', '06 12 34 56 78', '+33612345678'], ['IN', '98765 43210', '+919876543210']];
  for (const [countryIso, phone, e164] of valid) {
    const result = validateProfile({ ...base, countryIso, phone });
    assert.equal(result.ok, true, `${countryIso} ${phone}`);
    assert.equal(result.value.phoneE164, e164);
  }
});
test('a leading 0 is kept where it is part of the number (Côte d’Ivoire) and dropped where it is only a trunk prefix (UK)', () => {
  assert.equal(validateProfile({ ...base, countryIso: 'CI', phone: '07 07 07 07 07' }).value.phoneE164, '+2250707070707');
  assert.equal(validateProfile({ ...base, countryIso: 'GB', phone: '07911123456' }).value.phoneE164, '+447911123456');
});
test('invalid phone numbers are rejected', () => {
  for (const phone of ['', '   ', '123', '67123', '6712345678901234', 'abcdefghi', '671-234-56x', '++237671234567', undefined, 671234567]) {
    assert.ok(errorsOf({ ...base, phone }).phone, String(phone));
  }
});
test('a plus sign is refused, but a country code typed without it is tolerated and normalized correctly', () => {
  assert.ok(errorsOf({ ...base, phone: '+237 671 234 567' }).phone);
  // libphonenumber drops a repeated calling code when the rest is a valid number, so nothing is stored twice.
  assert.equal(validateProfile({ ...base, phone: '237671234567' }).value.phoneE164, '+237671234567');
  assert.ok(errorsOf({ ...base, phone: '2376712345' }).phone);
});
test('a number from another country is rejected for the chosen country', () => {
  assert.ok(errorsOf({ ...base, countryIso: 'CM', phone: '4155552671' }).phone);
});
test('absurdly long phone input is refused without being parsed', () => {
  assert.ok(errorsOf({ ...base, phone: '6'.repeat(5000) }).phone);
});
test('gender must be one of the four options', () => {
  for (const gender of ['Male', 'x', '', undefined, 1, ['male']]) assert.ok(errorsOf({ ...base, gender }).gender, String(gender));
  for (const gender of ['male', 'female', 'other', 'prefer_not_to_say']) assert.equal(validateProfile({ ...base, gender }).ok, true);
});
test('non-object bodies report every field and never throw', () => {
  for (const body of [null, undefined, 'x', 5, [], true]) {
    const errors = errorsOf(body);
    assert.deepEqual(Object.keys(errors).sort(), ['country', 'gender', 'name', 'phone']);
  }
});
test('unknown fields are ignored, including an attempt to choose the user id', () => {
  const result = validateProfile({ ...base, userId: 'user_other', clerk_user_id: 'user_other', phoneE164: '+10000000000', isAdmin: true });
  assert.deepEqual(Object.keys(result.value).sort(), ['countryIso', 'gender', 'name', 'phoneE164', 'phoneNational']);
  assert.equal(result.value.phoneE164, '+237671234567');
});
