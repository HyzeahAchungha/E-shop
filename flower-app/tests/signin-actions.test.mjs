import assert from 'node:assert/strict';
import test from 'node:test';
import { finishSocialSignin, signInWithPassword } from '../src/features/auth/signin-actions.ts';

const values = { email: ' jane@example.test ', password: ' password with spaces ' };

test('email sign-in trims the identifier, preserves the password and activates the returned session', async () => {
  const calls = [];
  const result = await signInWithPassword({ create: async (params) => {
    calls.push(params); return { status: 'complete', createdSessionId: 'synthetic-session' };
  } }, async (params) => calls.push(params), values);
  assert.deepEqual(calls, [
    { strategy: 'password', identifier: 'jane@example.test', password: values.password },
    { session: 'synthetic-session' },
  ]);
  assert.deepEqual(result, { kind: 'authenticated' });
});
test('missing credentials never contact Clerk', async () => {
  const signIn = { create: async () => assert.fail('must not call') };
  for (const credentials of [{ email: ' ', password: 'synthetic' }, { email: 'jane@example.test', password: '' }]) {
    await assert.rejects(signInWithPassword(signIn, async () => assert.fail('must not activate'), credentials));
  }
});
test('wrong credentials propagate rejection without session activation', async () => {
  await assert.rejects(signInWithPassword({ create: async () => { throw new Error('synthetic credentials rejected'); } }, async () => assert.fail('must not activate'), values));
});
test('first factor, second factor and client trust requirements never report authenticated', async () => {
  for (const status of ['needs_first_factor', 'needs_second_factor', 'needs_client_trust']) {
    const result = await signInWithPassword({ create: async () => ({ status, createdSessionId: null }) }, async () => assert.fail('must not activate'), values);
    assert.equal(result.kind, 'incomplete');
  }
});
test('complete status without a session is rejected', async () => {
  await assert.rejects(signInWithPassword({ create: async () => ({ status: 'complete', createdSessionId: null }) }, async () => assert.fail('must not activate'), values));
});
test('failed activation can be retried without submitting credentials again', async () => {
  let creates = 0;
  let activations = 0;
  const signIn = { status: null, identifier: null, createdSessionId: null, create: async () => {
    creates++; Object.assign(signIn, { status: 'complete', identifier: 'jane@example.test', createdSessionId: 'synthetic-session' }); return signIn;
  } };
  const activate = async () => { if (++activations === 1) throw new Error('synthetic activation failure'); };
  await assert.rejects(signInWithPassword(signIn, activate, values));
  assert.equal((await signInWithPassword(signIn, activate, values)).kind, 'authenticated');
  assert.equal(creates, 1);
  assert.equal(activations, 2);
});
test('changing email after a completed attempt starts a new sign-in', async () => {
  const calls = [];
  await signInWithPassword({ status: 'complete', identifier: 'another@example.test', createdSessionId: 'old-session', create: async (params) => {
    calls.push(params); return { status: 'complete', createdSessionId: 'new-session' };
  } }, async (params) => calls.push(params), values);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { session: 'new-session' });
});
test('cancelled and incomplete social flows never activate a session', async () => {
  for (const type of ['cancel', 'dismiss']) {
    const result = await finishSocialSignin({ authSessionResult: { type }, createdSessionId: 'ignored-session', setActive: async () => assert.fail('cancelled') });
    assert.equal(result.kind, 'cancelled');
  }
  assert.equal((await finishSocialSignin({ createdSessionId: null, setActive: async () => assert.fail('incomplete') })).kind, 'incomplete');
  assert.equal((await finishSocialSignin({ createdSessionId: 'synthetic-session' })).kind, 'incomplete');
});
test('completed social authentication activates only the returned session', async () => {
  const calls = [];
  assert.equal((await finishSocialSignin({ createdSessionId: 'synthetic-social', setActive: async (params) => calls.push(params) })).kind, 'authenticated');
  assert.deepEqual(calls, [{ session: 'synthetic-social' }]);
});
test('social session activation failure cannot report authentication success', async () => {
  await assert.rejects(finishSocialSignin({ createdSessionId: 'synthetic-session', setActive: async () => { throw new Error('synthetic activation failure'); } }));
});
