import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { loadSavedLanguage } from '@/lib/i18n';
import config from '../tamagui.config';

export default function RootLayout() {
  useEffect(() => {
    // Load saved language on app start
    loadSavedLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
