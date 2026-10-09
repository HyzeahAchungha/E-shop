export const CODE_LENGTH = 6;
export const RESEND_SECONDS = 60;

export function resendSecondsRemaining(sentAt: number, now = Date.now()): number {
  return sentAt ? Math.min(RESEND_SECONDS, Math.max(0, Math.ceil((sentAt + RESEND_SECONDS * 1000 - now) / 1000))) : 0;
}

export function updateCodeDigits(previous: string[], index: number, text: string) {
  const input = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
  const digits = [...previous];
  if (input.length === CODE_LENGTH) return { digits: input.split(''), focus: CODE_LENGTH - 1 };
  if (!input) {
    digits[index] = '';
    return { digits, focus: index };
  }
  const chunk = input.slice(0, CODE_LENGTH - index);
  chunk.split('').forEach((digit, offset) => { digits[index + offset] = digit; });
  return { digits, focus: Math.min(index + chunk.length, CODE_LENGTH - 1) };
}
