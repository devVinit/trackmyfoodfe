import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Toast } from '@/components/ui/toast';
import { AppStateProvider } from '@/context/app-state';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppStateProvider>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="onboarding-1" />
        <Stack.Screen name="onboarding-2" />
        <Stack.Screen name="onboarding-3" />
        <Stack.Screen name="onboarding-4" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="day-detail" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="food-detail" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="change-password" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
      <Toast />
    </AppStateProvider>
  );
}
