import assert from 'node:assert/strict';
import test from 'node:test';
import { resendSignupCode, verifySignupCode } from '../src/features/auth/verification-actions.ts';
import { resendSecondsRemaining, updateCodeDigits } from '../src/features/auth/verification-utils.ts';
import { getCodeSentAt, recordCodeSent } from '../src/store/email-verification.ts';

const blank = () => Array(6).fill('');

test('six digit autofill replaces the code regardless of the active box', () => {
  assert.deepEqual(updateCodeDigits(blank(), 3, '123456'), { digits: ['1','2','3','4','5','6'], focus: 5 });
});
test('partial paste distributes digits, filters other characters and stays within six boxes', () => {
  assert.deepEqual(updateCodeDigits(blank(), 1, 'a1-2b3'), { digits: ['', '1','2','3','',''], focus: 4 });
  assert.deepEqual(updateCodeDigits(blank(), 5, '89'), { digits: ['','','','','','8'], focus: 5 });
  assert.deepEqual(updateCodeDigits(['1','2','3','','',''], 1, ''), { digits: ['1','','3','','',''], focus: 1 });
});
test('resend countdown uses elapsed wall time, rounds up and expires after exactly 60 seconds', () => {
  assert.equal(resendSecondsRemaining(1000, 1000), 60);
  assert.equal(resendSecondsRemaining(1000, 999), 60);
  assert.equal(resendSecondsRemaining(1000, 1001), 60);
  assert.equal(resendSecondsRemaining(1000, 60000), 1);
  assert.equal(resendSecondsRemaining(1000, 61000), 0);
  assert.equal(resendSecondsRemaining(1000, 500000), 0);
  assert.equal(resendSecondsRemaining(0, 1000), 0);
});
test('sent timestamp follows its signup and does not leak to another signup', () => {
  recordCodeSent('synthetic-signup-A', 12345);
  assert.equal(getCodeSentAt('synthetic-signup-A'), 12345);
  assert.equal(getCodeSentAt('synthetic-signup-B'), 0);
  recordCodeSent('synthetic-signup-B', 22222);
  assert.equal(getCodeSentAt('synthetic-signup-B'), 22222);
  assert.equal(getCodeSentAt('synthetic-signup-A'), 0);
  assert.throws(() => recordCodeSent(undefined));
});
test('malformed codes never call Clerk or activate a session', async () => {
  for (const code of ['', '1234', '12345a', '1234567']) {
    await assert.rejects(verifySignupCode({ attemptEmailAddressVerification: async () => assert.fail('must not verify') }, async () => assert.fail('must not activate'), code));
  }
});
test('session activates only after Clerk reports complete signup', async () => {
  const calls = [];
  const result = await verifySignupCode({ status: 'missing_requirements', attemptEmailAddressVerification: async (params) => {
    calls.push(params); return { status: 'complete', createdSessionId: 'synthetic-session' };
  } }, async (params) => calls.push(params), '123456');
  assert.deepEqual(result, { kind: 'authenticated' });
  assert.deepEqual(calls, [{ code: '123456' }, { session: 'synthetic-session' }]);
});
test('invalid or expired codes propagate rejection and never activate', async () => {
  await assert.rejects(verifySignupCode({ status: 'missing_requirements', attemptEmailAddressVerification: async () => { throw new Error('synthetic invalid or expired code'); } }, async () => assert.fail('must not activate'), '123456'));
});
test('incomplete signup and missing session never report authenticated', async () => {
  const incomplete = await verifySignupCode({ attemptEmailAddressVerification: async () => ({ status: 'missing_requirements', createdSessionId: null }) }, async () => assert.fail('must not activate'), '123456');
  assert.equal(incomplete.kind, 'incomplete');
  await assert.rejects(verifySignupCode({ attemptEmailAddressVerification: async () => ({ status: 'complete', createdSessionId: null }) }, async () => assert.fail('must not activate'), '123456'));
});
test('activation can be retried without verifying an already used code again', async () => {
  let activations = 0;
  const signup = { status: 'complete', createdSessionId: 'synthetic-session', attemptEmailAddressVerification: async () => assert.fail('already verified') };
  const activate = async () => { if (++activations === 1) throw new Error('synthetic activation failure'); };
  await assert.rejects(verifySignupCode(signup, activate, '123456'));
  assert.equal((await verifySignupCode(signup, activate, '123456')).kind, 'authenticated');
  assert.equal(activations, 2);
});
const resendResource = (send) => ({ emailAddress: 'synthetic@example.test', unverifiedFields: ['email_address'], prepareEmailAddressVerification: send });
test('resend is blocked during cooldown or without pending email verification', async () => {
  const resource = resendResource(async () => assert.fail('must not send'));
  await assert.rejects(resendSignupCode(resource, 1, () => assert.fail('must not record')));
  await assert.rejects(resendSignupCode({ ...resource, unverifiedFields: [] }, 0, () => assert.fail('must not record')));
});
test('resend resets the timestamp only after a successful code delivery', async () => {
  const calls = [];
  await resendSignupCode(resendResource(async (params) => calls.push(params)), 0, () => calls.push('sent'));
  assert.deepEqual(calls, [{ strategy: 'email_code' }, 'sent']);
  await assert.rejects(resendSignupCode(resendResource(async () => { throw new Error('synthetic delivery failure'); }), 0, () => assert.fail('must not reset cooldown')));
});
