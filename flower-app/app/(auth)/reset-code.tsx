import { useRouter } from 'expo-router';

import { VerificationForm, type VerificationCopy } from '@/features/auth/VerificationForm';
import { useResetCode } from '@/features/auth/useResetCode';
import { hasClerkConfiguration } from '@/lib/clerk';

// Same six-box screen as signup verification, with password reset wording.
const RESET_COPY: Partial<VerificationCopy> = {
  backLabel: 'Back to Forgot Password',
  emptySubtitle: 'Request a password reset to receive your code.',
  missingAttemptError: 'Return to Forgot Password to request a reset code.',
  completedNotice: 'Code verified. Opening the next step…',
};

type RouteProps = { onBack: () => void; onVerified: () => void };

function ConnectedResetCode(props: RouteProps) {
  const resetCode = useResetCode();
  return <VerificationForm {...resetCode} copy={RESET_COPY} {...props} />;
}

export default function ResetCodeRoute() {
  const router = useRouter();
  const props: RouteProps = {
    onBack: () => router.dismissTo('/forgot-password'),
    // Replace, so Back from New Password cannot return to a code that was already used.
    onVerified: () => router.replace('/new-password'),
  };
  return hasClerkConfiguration ? <ConnectedResetCode {...props} /> : <VerificationForm copy={RESET_COPY} {...props} />;
}
