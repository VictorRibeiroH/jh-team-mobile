import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type SessionUser = {
  id: string;
  studentId: string;
  name: string;
  role: 'STUDENT';
};
export type MobileSession = {
  token: string;
  expiresAt: string;
  user: SessionUser;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function readUser(value: unknown): SessionUser {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.studentId !== 'string' ||
    typeof value.name !== 'string' ||
    value.role !== 'STUDENT'
  )
    throw new Error('Não foi possível confirmar seu acesso.');
  return {
    id: value.id,
    studentId: value.studentId,
    name: value.name,
    role: value.role,
  };
}
export function apiUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  // Desenvolvimento local: mesmo Mac que serve o Expo, com backend na porta 3010.
  const host =
    Platform.OS === 'web'
      ? window.location.hostname
      : Constants.expoConfig?.hostUri
        ? new URL(`http://${Constants.expoConfig.hostUri}`).hostname
        : null;
  if (!host)
    throw new Error('Configure o endereço do servidor para conectar seu app.');
  return `http://${host}:3010`;
}
export class SessionExpiredError extends Error {}
export async function request(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${apiUrl()}${path}`, {
      ...options,
      signal: controller.signal,
    });
    const payload: unknown =
      response.status === 204 ? null : await response.json();
    if (!response.ok) {
      const message =
        isRecord(payload) && typeof payload.error === 'string'
          ? payload.error
          : 'Não foi possível concluir o acesso.';
      if (path !== '/api/mobile/auth' && response.status === 401)
        throw new SessionExpiredError(message);
      throw new Error(message);
    }
    return payload;
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error && error.name === 'AbortError')
    )
      throw new Error(
        'Não foi possível conectar. Verifique sua rede e tente novamente.',
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export async function loginRequest(code: string): Promise<MobileSession> {
  const payload = await request('/api/mobile/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });
  if (
    !isRecord(payload) ||
    typeof payload.token !== 'string' ||
    typeof payload.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(payload.expiresAt))
  )
    throw new Error('Não foi possível confirmar seu acesso.');
  return {
    token: payload.token,
    expiresAt: payload.expiresAt,
    user: readUser(payload.user),
  };
}
export async function getSessionRequest(token: string): Promise<SessionUser> {
  const payload = await request('/api/mobile/session', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readUser(isRecord(payload) ? payload.user : null);
}
export async function logoutRequest(token: string) {
  await request('/api/mobile/session', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
