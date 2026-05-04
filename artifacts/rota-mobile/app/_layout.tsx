import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { setBaseUrl } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RotaProvider } from "@/context/RotaContext";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RotaProvider>
                <Stack
                  screenOptions={{
                    headerBackTitle: "Back",
                    headerTintColor: "#0F766E",
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="staff/add"
                    options={{
                      presentation: "modal",
                      title: "Add Staff",
                      headerStyle: { backgroundColor: "#FFFFFF" },
                      headerTitleStyle: {
                        fontFamily: "Inter_600SemiBold",
                        color: "#0F172A",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="staff/[id]"
                    options={{
                      title: "Staff Detail",
                      headerStyle: { backgroundColor: "#FFFFFF" },
                      headerTitleStyle: {
                        fontFamily: "Inter_600SemiBold",
                        color: "#0F172A",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="shift/[staffId]/[date]"
                    options={{
                      presentation: "modal",
                      title: "Edit Shift",
                      headerStyle: { backgroundColor: "#FFFFFF" },
                      headerTitleStyle: {
                        fontFamily: "Inter_600SemiBold",
                        color: "#0F172A",
                      },
                    }}
                  />
                </Stack>
              </RotaProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
