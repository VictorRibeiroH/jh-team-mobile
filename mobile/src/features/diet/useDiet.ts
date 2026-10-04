import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { request } from '@/features/auth/api';
export type Nutrients = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};
export type Meal = {
  key: string;
  name: string;
  notes: string | null;
  completed: boolean;
  totals: Nutrients;
  items: ({
    name: string;
    grams: number;
    quantity?: number;
    unitLabel?: string;
    unitGrams?: number;
    source: string;
    sourceUrl: string;
  } & Nutrients)[];
};
export type DietDay = {
  localDate: string;
  plan: {
    id: string;
    name: string;
    notes: string | null;
    totals: Nutrients;
    meals: Meal[];
  } | null;
  consumed: Nutrients;
  previousMeals: ({ planId: string; mealKey: string } & Meal)[];
};
export function useDiet() {
  const { session } = useAuth();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [day, setDay] = useState(() => new Date().toLocaleDateString());
  const client = useQueryClient();
  const key = ['diet', session?.user.studentId, timezone, day];
  useEffect(() => {
    const refresh = () => {
      setDay(new Date().toLocaleDateString());
      void client.invalidateQueries({ queryKey: ['diet'] });
    };
    const interval = setInterval(
      () => setDay(new Date().toLocaleDateString()),
      30000,
    );
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [client]);
  const query = useQuery<DietDay>({
    queryKey: key,
    enabled: !!session,
    staleTime: 0,
    refetchInterval: 60000,
    queryFn: async () =>
      (await request(
        `/api/mobile/diet?timezone=${encodeURIComponent(timezone)}`,
        { headers: { Authorization: `Bearer ${session!.token}` } },
      )) as DietDay,
  });
  async function check(planId: string, mealKey: string, completed: boolean) {
    if (!session) return;
    const next = (await request('/api/mobile/diet', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, mealKey, completed, timezone }),
    })) as DietDay;
    client.setQueryData(key, next);
    await client.invalidateQueries({
      queryKey: ['diet', session.user.studentId],
    });
  }
  return { ...query, check };
}
export const number = (value: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
