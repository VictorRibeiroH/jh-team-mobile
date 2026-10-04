import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const KEY = 'jh-team.session';
export async function readSession(): Promise<{
  token: string;
  expiresAt: string;
} | null> {
  const raw =
    Platform.OS === 'web'
      ? sessionStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('token' in value) ||
      typeof value.token !== 'string' ||
      !('expiresAt' in value) ||
      typeof value.expiresAt !== 'string' ||
      !(Date.parse(value.expiresAt) > Date.now())
    )
      return null;
    return { token: value.token, expiresAt: value.expiresAt };
  } catch {
    return null;
  }
}
export async function saveSession(value: { token: string; expiresAt: string }) {
  const raw = JSON.stringify(value);
  if (Platform.OS === 'web') sessionStorage.setItem(KEY, raw);
  else
    await SecureStore.setItemAsync(KEY, raw, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}
export async function deleteSession() {
  if (Platform.OS === 'web') sessionStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
}
