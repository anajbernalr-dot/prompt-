import { AbrilFatface_400Regular } from '@expo-google-fonts/abril-fatface';
import { CaveatBrush_400Regular } from '@expo-google-fonts/caveat-brush';
import { CoveredByYourGrace_400Regular } from '@expo-google-fonts/covered-by-your-grace';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { ToastHost } from '@/components/Toast';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.blue,
    text: colors.text,
    border: colors.border,
  },
};

// Dev-only hook used by the screenshot/QA scripts to drive state from the browser.
if (__DEV__ && Platform.OS === 'web') {
  (globalThis as unknown as { __pdv: typeof useAppStore }).__pdv = useAppStore;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_900Black,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    PermanentMarker_400Regular,
    CoveredByYourGrace_400Regular,
    AbrilFatface_400Regular,
    CaveatBrush_400Regular,
  });
  const hydrated = useAppStore((s) => s.hydrated);
  const loggedIn = useAppStore((s) => s.user !== null);
  const onboarded = useAppStore((s) => s.onboarded);

  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}>
        {/* Logged out */}
        <Stack.Protected guard={!loggedIn}>
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="signup" />
          <Stack.Screen name="login" />
        </Stack.Protected>

        {/* Just signed up */}
        <Stack.Protected guard={loggedIn && !onboarded}>
          <Stack.Screen name="connect" options={{ animation: 'fade' }} />
        </Stack.Protected>

        {/* The app */}
        <Stack.Protected guard={loggedIn && onboarded}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="place/[id]" />
          <Stack.Screen name="event/[id]" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="inspiration" options={{ animation: 'fade' }} />
          <Stack.Screen name="plans/[id]" />
          <Stack.Screen name="review/new" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="plan/new" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="plan/place" />
          <Stack.Screen name="plan/friends" />
          <Stack.Screen name="plan/review" />
          <Stack.Screen name="plan/ready" options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </ThemeProvider>
  );
}
