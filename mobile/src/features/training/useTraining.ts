import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { request } from '@/features/auth/api';
import type { TrainingPlan } from './types';
export function useTraining() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['training', session?.user.studentId],
    enabled: Boolean(session),
    staleTime: 0,
    refetchInterval: 60_000,
    queryFn: async (): Promise<TrainingPlan | null> => {
      const payload = (await request('/api/mobile/training', {
        headers: { Authorization: `Bearer ${session?.token}` },
      })) as { plan?: TrainingPlan | null };
      if (payload.plan === null) return null;
      if (
        !payload.plan ||
        !Array.isArray(payload.plan.sessions) ||
        !Array.isArray(payload.plan.weekSchedule)
      )
        throw new Error('Não foi possível carregar sua ficha.');
      return payload.plan;
    },
  });
}
