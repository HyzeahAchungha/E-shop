import { useRouter } from 'expo-router';

import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';
import { useForgotPassword } from '@/features/auth/useForgotPassword';
import { hasClerkConfiguration } from '@/lib/clerk';

type RouteProps = { onBack: () => void; onSent: () => void };

function ConnectedForgotPassword(props: RouteProps) {
  const forgot = useForgotPassword();
  return <ForgotPasswordForm {...forgot} {...props} />;
}

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const props: RouteProps = {
    onBack: () => router.dismissTo('/signin'),
    onSent: () => router.push('/reset-code'),
  };
  return hasClerkConfiguration ? <ConnectedForgotPassword {...props} /> : <ForgotPasswordForm {...props} />;
}
