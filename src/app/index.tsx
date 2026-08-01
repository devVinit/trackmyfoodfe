import { Redirect } from 'expo-router';

import { useAppState } from '@/context/app-state';

const ONBOARDING_ROUTES = ['/onboarding-1', '/onboarding-2', '/onboarding-3', '/onboarding-4'] as const;

export default function Index() {
  const { authReady, isSignedIn, account } = useAppState();

  // Wait for the persisted session to be restored before deciding where to go;
  // the native splash screen stays up until then.
  if (!authReady) return null;

  if (!isSignedIn) return <Redirect href="/sign-in" />;

  if (account && !account.is_onboarded) {
    const route = ONBOARDING_ROUTES[account.onboarding_step - 1] ?? ONBOARDING_ROUTES[0];
    return <Redirect href={route} />;
  }

  return <Redirect href="/(tabs)/home" />;
}
