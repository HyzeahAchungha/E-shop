import { useSyncExternalStore } from 'react';

// Device-memory only. No code, email address, password or token is persisted here.
let lastSend: { signupId: string; sentAt: number } | null = null;
const listeners = new Set<() => void>();

export function getCodeSentAt(signupId?: string): number {
  return signupId && lastSend?.signupId === signupId ? lastSend.sentAt : 0;
}

export function recordCodeSent(signupId: string | undefined, sentAt = Date.now()): void {
  if (!signupId) throw new Error('No pending signup identity.');
  lastSend = { signupId, sentAt };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useCodeSentAt(signupId?: string): number {
  return useSyncExternalStore(subscribe, () => getCodeSentAt(signupId), () => 0);
}
