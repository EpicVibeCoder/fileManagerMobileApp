import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { ActionSheetHost } from "@/components/action-sheet";
import { NamePromptHost } from "@/components/name-prompt";
import { AppProviders, useAuth } from "@/lib/auth-context";
import { VaultProvider } from "@/lib/vault-context";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <NamePromptHost />
      <ActionSheetHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <VaultProvider>
        <RootNavigator />
      </VaultProvider>
    </AppProviders>
  );
}
