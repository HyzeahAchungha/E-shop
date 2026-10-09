import assert from 'node:assert/strict';
import test from 'node:test';
import { finishSocialSignup, sendSignupCode } from '../src/features/auth/signup-actions.ts';

const values = { name: '  Jane  Flower Bloom  ', email: ' jane@example.test ', password: 'synthetic-password' };

test('email signup creates before sending a code and preserves Clerk verification state', async () => {
  const calls = [];
  const signup = {
    create: async (params) => calls.push(['create', params]),
    prepareEmailAddressVerification: async (params) => calls.push(['code', params]),
  };
  const attempt = { email: null };
  const result = await sendSignupCode(signup, values, attempt, () => calls.push(['pending']));
  assert.deepEqual(calls, [
    ['create', { firstName: 'Jane', lastName: 'Flower Bloom', emailAddress: 'jane@example.test', password: values.password }],
    ['pending'], ['code', { strategy: 'email_code' }],
  ]);
  assert.deepEqual(result, { kind: 'verification', email: 'jane@example.test' });
});

test('code delivery failure retries the existing signup without creating another account', async () => {
  let creates = 0;
  let sends = 0;
  const signup = {
    create: async () => { creates++; },
    prepareEmailAddressVerification: async () => { if (++sends === 1) throw new Error('synthetic delivery failure'); },
  };
  const attempt = { email: null };
  await assert.rejects(sendSignupCode(signup, values, attempt, () => {}));
  await sendSignupCode(signup, values, attempt, () => {});
  assert.equal(creates, 1);
  assert.equal(sends, 2);
});

test('rejected account creation never sends a verification code', async () => {
  let sends = 0;
  const attempt = { email: null };
  await assert.rejects(sendSignupCode({
    create: async () => { throw new Error('synthetic rejection'); },
    prepareEmailAddressVerification: async () => { sends++; },
  }, values, attempt, () => assert.fail('must not enter pending state')));
  assert.equal(sends, 0);
  assert.equal(attempt.email, null);
});

test('completed social auth activates only the session returned by Clerk', async () => {
  const calls = [];
  assert.deepEqual(await finishSocialSignup({
    createdSessionId: 'synthetic-session', setActive: async (params) => calls.push(params),
  }, { email: null }, () => assert.fail('already complete')), { kind: 'authenticated' });
  assert.deepEqual(calls, [{ session: 'synthetic-session' }]);
});

test('cancelled social auth and incomplete requirements never activate a session', async () => {
  const setActive = async () => assert.fail('must not activate');
  for (const type of ['cancel', 'dismiss']) {
    assert.deepEqual(await finishSocialSignup({ createdSessionId: null, setActive, authSessionResult: { type } }, { email: null }, () => {}), { kind: 'cancelled' });
  }
  const result = await finishSocialSignup({ createdSessionId: null, setActive }, { email: null }, () => {});
  assert.equal(result.kind, 'incomplete');
});

test('social auth requiring email verification sends a code without activating a session', async () => {
  const calls = [];
  const attempt = { email: null };
  const result = await finishSocialSignup({
    createdSessionId: null,
    setActive: async () => assert.fail('must not activate'),
    signUp: { emailAddress: 'social@example.test', unverifiedFields: ['email_address'], prepareEmailAddressVerification: async (params) => calls.push(params) },
  }, attempt, () => calls.push('pending'));
  assert.deepEqual(calls, ['pending', { strategy: 'email_code' }]);
  assert.deepEqual(result, { kind: 'verification', email: 'social@example.test' });
});

test('session activation failure does not report authentication success', async () => {
  await assert.rejects(finishSocialSignup({
    createdSessionId: 'synthetic-session', setActive: async () => { throw new Error('activation failed'); },
  }, { email: null }, () => {}));
});
