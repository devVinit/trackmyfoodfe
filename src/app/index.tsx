import { Redirect } from 'expo-router';

import { useAppState } from '@/context/app-state';

export default function Index() {
  const { authReady, isSignedIn } = useAppState();

  // Wait for the persisted session to be restored before deciding where to go;
  // the native splash screen stays up until then.
  if (!authReady) return null;

  return <Redirect href={isSignedIn ? '/(tabs)/home' : '/sign-in'} />;
}
