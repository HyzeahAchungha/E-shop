import { useRouter } from 'expo-router';

import { NewPasswordForm } from '@/features/auth/NewPasswordForm';
import { useNewPassword } from '@/features/auth/useNewPassword';
import { hasClerkConfiguration } from '@/lib/clerk';
import { markPasswordResetComplete } from '@/store/password-reset';

type RouteProps = { onBack: () => void; onDone: () => void; onRestart: () => void };

function ConnectedNewPassword({ onBack, ...props }: RouteProps) {
  const newPassword = useNewPassword();
  const { cancel, ...form } = newPassword;
  // Back abandons the verified reset, then returns to Sign In.
  return <NewPasswordForm {...form} {...props} onBack={() => { cancel(); onBack(); }} />;
}

export default function NewPasswordRoute() {
  const router = useRouter();
  const props: RouteProps = {
    onBack: () => router.dismissTo('/signin'),
    onDone: () => {
      markPasswordResetComplete();
      router.dismissTo('/signin');
    },
    onRestart: () => router.replace('/forgot-password'),
  };
  return hasClerkConfiguration ? <ConnectedNewPassword {...props} /> : <NewPasswordForm {...props} />;
}
