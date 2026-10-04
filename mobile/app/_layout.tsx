import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/providers/AppProviders';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { Loading } from '@/components/ui/Loading';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme';

function Navigation() {
  const { session, restoring } = useAuth();
  if (restoring)
    return (
      <Screen>
        <Loading label="Preparando seu acesso" />
      </Screen>
    );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
export default function RootLayout() {
  return (
    <AppProviders>
      <AuthProvider>
        <StatusBar style="light" />
        <Navigation />
      </AuthProvider>
    </AppProviders>
  );
}
