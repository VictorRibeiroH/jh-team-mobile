import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  getSessionRequest,
  loginRequest,
  logoutRequest,
  SessionExpiredError,
  type MobileSession,
} from './api';
import { readSession, saveSession, deleteSession } from './session-storage';
import { useRestTimer } from '@/features/training/rest-timer-store';
import { useHydration } from '@/features/dashboard/useHydration';

type AuthContextValue = {
  session: MobileSession | null;
  restoring: boolean;
  signIn: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [restoring, setRestoring] = useState(true);
  const generation = useRef(0);
  const queryClient = useQueryClient();
  const clearLocal = useCallback(async () => {
    generation.current++;
    setSession(null);
    queryClient.clear();
    useHydration.getState().reset();
    useRestTimer.getState().stop();
    await deleteSession();
  }, [queryClient]);
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const saved = await readSession();
        if (!saved) return;
        const user = await getSessionRequest(saved.token);
        if (active) setSession({ ...saved, user });
      } catch (error) {
        if (error instanceof SessionExpiredError) await deleteSession();
      } finally {
        if (active) setRestoring(false);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    const currentGeneration = generation.current;
    const token = session.token;
    async function validate() {
      try {
        await getSessionRequest(token);
      } catch (error) {
        if (
          error instanceof SessionExpiredError &&
          currentGeneration === generation.current
        )
          await clearLocal();
      }
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void validate();
    });
    // Revalida também a cada minuto enquanto a tela permanece aberta.
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') void validate();
    }, 60_000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [session, clearLocal]);
  async function signIn(code: string) {
    const nextSession = await loginRequest(code);
    await saveSession(nextSession);
    generation.current++;
    queryClient.clear();
    useHydration.getState().reset();
    useRestTimer.getState().stop();
    setSession(nextSession);
  }
  async function signOut() {
    const token = session?.token;
    await clearLocal();
    if (token) await logoutRequest(token).catch(() => undefined);
  }
  return (
    <AuthContext.Provider value={{ session, restoring, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth exige AuthProvider.');
  return value;
}
