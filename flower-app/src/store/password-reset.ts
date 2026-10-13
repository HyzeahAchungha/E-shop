import { useSyncExternalStore } from 'react';

// Device-memory only. Holds Clerk sign-in attempt IDs and one UI flag; never a code,
// email address, password or token.
const closedAttempts = new Set<string>();
let resetNotice = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/**
 * Marks a reset attempt as finished or cancelled. Clerk leaves a finished attempt in the
 * "complete" state, so Sign In must never treat it as a session activation retry, and
 * the New Password screen must not accept it again.
 */
export function closeResetAttempt(signInId?: string | null): void {
  if (signInId) closedAttempts.add(signInId);
}

export function isResetAttemptClosed(signInId?: string | null): boolean {
  return signInId ? closedAttempts.has(signInId) : false;
}

export function markPasswordResetComplete(): void {
  resetNotice = true;
  notify();
}

export function clearPasswordResetNotice(): void {
  if (!resetNotice) return;
  resetNotice = false;
  notify();
}

export function hasPasswordResetNotice(): boolean {
  return resetNotice;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function usePasswordResetNotice(): boolean {
  return useSyncExternalStore(subscribe, hasPasswordResetNotice, () => false);
}
