import assert from 'node:assert/strict';
import test from 'node:test';
import { findResetEmailAddressId, requestResetCode, resendResetCode, setNewPassword, verifyResetCode } from '../src/features/auth/password-reset-actions.ts';
import { signInWithPassword } from '../src/features/auth/signin-actions.ts';
import { clearPasswordResetNotice, closeResetAttempt, hasPasswordResetNotice, isResetAttemptClosed, markPasswordResetComplete } from '../src/store/password-reset.ts';

const resetFactor = { strategy: 'reset_password_email_code', emailAddressId: 'synthetic-email-id', safeIdentifier: 'j***@example.test' };

test('requesting a code trims the email and starts a reset_password_email_code attempt', async () => {
  const calls = [];
  const result = await requestResetCode({ create: async (params) => {
    calls.push(params); return { id: 'synthetic-signin', status: 'needs_first_factor' };
  } }, '  jane@example.test ');
  assert.deepEqual(calls, [{ strategy: 'reset_password_email_code', identifier: 'jane@example.test' }]);
  assert.deepEqual(result, { signInId: 'synthetic-signin' });
});
test('an invalid email never contacts Clerk', async () => {
  for (const email of ['', '   ', 'not-an-email', 'a@b', 'a b@c.d']) {
    await assert.rejects(requestResetCode({ create: async () => assert.fail('must not call') }, email));
  }
});
test('Clerk rejection or an unexpected status never reports the code as sent', async () => {
  await assert.rejects(requestResetCode({ create: async () => { throw new Error('synthetic unknown account'); } }, 'jane@example.test'));
  await assert.rejects(requestResetCode({ create: async () => ({ id: 'synthetic-signin', status: 'complete' }) }, 'jane@example.test'));
  await assert.rejects(requestResetCode({ create: async () => ({ status: 'needs_first_factor' }) }, 'jane@example.test'));
});

test('malformed codes never call Clerk', async () => {
  for (const code of ['', '1234', '12345a', '1234567']) {
    await assert.rejects(verifyResetCode({ status: 'needs_first_factor', attemptFirstFactor: async () => assert.fail('must not verify') }, code));
  }
});
test('a correct code moves the attempt to needs_new_password without creating a session', async () => {
  const calls = [];
  const result = await verifyResetCode({ status: 'needs_first_factor', attemptFirstFactor: async (params) => {
    calls.push(params); return { status: 'needs_new_password' };
  } }, '123456');
  assert.deepEqual(result, { kind: 'verified' });
  assert.deepEqual(calls, [{ strategy: 'reset_password_email_code', code: '123456' }]);
});
test('invalid or expired codes propagate rejection', async () => {
  await assert.rejects(verifyResetCode({ status: 'needs_first_factor', attemptFirstFactor: async () => { throw new Error('synthetic invalid code'); } }, '123456'));
});
test('other statuses after the code never report verified', async () => {
  for (const status of ['needs_first_factor', 'needs_second_factor', 'needs_client_trust', 'complete']) {
    const result = await verifyResetCode({ status: 'needs_first_factor', attemptFirstFactor: async () => ({ status }) }, '123456');
    assert.equal(result.kind, 'incomplete');
  }
});
test('an already verified attempt does not spend its code again', async () => {
  const result = await verifyResetCode({ status: 'needs_new_password', attemptFirstFactor: async () => assert.fail('already verified') }, '123456');
  assert.deepEqual(result, { kind: 'verified' });
});

test('the resend email factor is found only when Clerk offers one', () => {
  assert.equal(findResetEmailAddressId([{ strategy: 'password' }, resetFactor]), 'synthetic-email-id');
  assert.equal(findResetEmailAddressId([{ strategy: 'password' }]), null);
  assert.equal(findResetEmailAddressId(null), null);
  assert.equal(findResetEmailAddressId([{ strategy: 'reset_password_phone_code', phoneNumberId: 'synthetic-phone-id' }]), null);
});
test('resend is blocked during cooldown or without a pending reset', async () => {
  const prepare = async () => assert.fail('must not send');
  await assert.rejects(resendResetCode({ supportedFirstFactors: [resetFactor], prepareFirstFactor: prepare }, 1, () => assert.fail('must not record')));
  await assert.rejects(resendResetCode({ supportedFirstFactors: [], prepareFirstFactor: prepare }, 0, () => assert.fail('must not record')));
  await assert.rejects(resendResetCode({ supportedFirstFactors: null, prepareFirstFactor: prepare }, 0, () => assert.fail('must not record')));
});
test('resend uses the email factor and resets the cooldown only after delivery succeeds', async () => {
  const calls = [];
  await resendResetCode({ supportedFirstFactors: [resetFactor], prepareFirstFactor: async (params) => calls.push(params) }, 0, () => calls.push('sent'));
  assert.deepEqual(calls, [{ strategy: 'reset_password_email_code', emailAddressId: 'synthetic-email-id' }, 'sent']);
  await assert.rejects(resendResetCode({ supportedFirstFactors: [resetFactor], prepareFirstFactor: async () => { throw new Error('synthetic delivery failure'); } }, 0, () => assert.fail('must not reset cooldown')));
});

test('a short password never calls Clerk', async () => {
  await assert.rejects(setNewPassword({ id: 'synthetic-signin', status: 'needs_new_password', resetPassword: async () => assert.fail('must not reset') }, 'short', () => assert.fail('must not close')));
});
test('a password cannot be set before the code is verified', async () => {
  for (const status of ['needs_first_factor', 'needs_identifier', 'complete', null]) {
    await assert.rejects(setNewPassword({ id: 'synthetic-signin', status, resetPassword: async () => assert.fail('must not reset') }, 'long enough password', () => assert.fail('must not close')));
  }
});
test('a completed reset keeps the password exactly as typed, ends other sessions and closes the attempt', async () => {
  const calls = [];
  const password = '  spaced password  ';
  const result = await setNewPassword({ id: 'synthetic-signin', status: 'needs_new_password', resetPassword: async (params) => {
    calls.push(params); return { id: 'synthetic-signin', status: 'complete', createdSessionId: 'synthetic-session' };
  } }, password, (id) => calls.push(`closed:${id}`));
  assert.deepEqual(result, { kind: 'reset' });
  assert.deepEqual(calls, [{ password, signOutOfOtherSessions: true }, 'closed:synthetic-signin']);
});
test('a rejected or incomplete reset never reports success or closes the attempt', async () => {
  await assert.rejects(setNewPassword({ id: 'synthetic-signin', status: 'needs_new_password', resetPassword: async () => { throw new Error('synthetic password rejected'); } }, 'long enough password', () => assert.fail('must not close')));
  for (const status of ['needs_second_factor', 'needs_client_trust', 'needs_new_password']) {
    const result = await setNewPassword({ id: 'synthetic-signin', status: 'needs_new_password', resetPassword: async () => ({ id: 'synthetic-signin', status }) }, 'long enough password', () => assert.fail('must not close'));
    assert.equal(result.kind, 'incomplete');
  }
});

test('closed reset attempts are remembered per attempt only', () => {
  assert.equal(isResetAttemptClosed('synthetic-A'), false);
  closeResetAttempt('synthetic-A');
  assert.equal(isResetAttemptClosed('synthetic-A'), true);
  assert.equal(isResetAttemptClosed('synthetic-B'), false);
  closeResetAttempt(undefined);
  closeResetAttempt(null);
  assert.equal(isResetAttemptClosed(undefined), false);
  assert.equal(isResetAttemptClosed(null), false);
});
test('the sign-in success notice can be shown once and cleared', () => {
  assert.equal(hasPasswordResetNotice(), false);
  markPasswordResetComplete();
  assert.equal(hasPasswordResetNotice(), true);
  clearPasswordResetNotice();
  assert.equal(hasPasswordResetNotice(), false);
});

test('a finished password reset cannot be reused to sign in without checking the password', async () => {
  closeResetAttempt('synthetic-reset-attempt');
  const calls = [];
  const signIn = { id: 'synthetic-reset-attempt', status: 'complete', identifier: 'jane@example.test', createdSessionId: 'reset-session',
    create: async (params) => { calls.push(params); throw new Error('synthetic wrong password'); } };
  await assert.rejects(signInWithPassword(signIn, async () => assert.fail('must not activate'),
    { email: 'jane@example.test', password: 'wrong password' }, isResetAttemptClosed));
  assert.deepEqual(calls, [{ strategy: 'password', identifier: 'jane@example.test', password: 'wrong password' }]);
});
test('a genuine failed activation can still be retried when the attempt is not a closed reset', async () => {
  let activations = 0;
  const signIn = { id: 'synthetic-password-attempt', status: 'complete', identifier: 'jane@example.test', createdSessionId: 'synthetic-session',
    create: async () => assert.fail('must not resubmit credentials') };
  const activate = async () => { if (++activations === 1) throw new Error('synthetic activation failure'); };
  const values = { email: 'jane@example.test', password: 'synthetic password' };
  await assert.rejects(signInWithPassword(signIn, activate, values, isResetAttemptClosed));
  assert.equal((await signInWithPassword(signIn, activate, values, isResetAttemptClosed)).kind, 'authenticated');
  assert.equal(activations, 2);
});
