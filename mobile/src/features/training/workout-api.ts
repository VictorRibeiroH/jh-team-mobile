import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { apiUrl, request, SessionExpiredError } from '@/features/auth/api';
import type {
  Workout,
  WorkoutSummary,
  AssignedForm,
  CoachMessage,
} from './workout-types';
export async function workoutRequest(
  token: string,
  path: string,
  body?: unknown,
  method = 'POST',
) {
  return request(path, {
    method: body ? method : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
export async function startWorkout(
  token: string,
  sessionId: string,
): Promise<Workout> {
  return (
    (await workoutRequest(token, '/api/mobile/workouts', {
      sessionId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })) as { workout: Workout }
  ).workout;
}
export async function getWorkout(token: string, id: string): Promise<Workout> {
  return (
    (await workoutRequest(token, `/api/mobile/workouts/${id}`)) as {
      workout: Workout;
    }
  ).workout;
}
export async function saveSet(
  token: string,
  id: string,
  setId: string,
  weightKg: number,
  reps: number,
): Promise<Workout> {
  return (
    (await workoutRequest(
      token,
      `/api/mobile/workouts/${id}/sets/${setId}`,
      { weightKg, reps },
      'PATCH',
    )) as { workout: Workout }
  ).workout;
}
export async function finishWorkout(
  token: string,
  id: string,
): Promise<Workout> {
  return (
    (await workoutRequest(token, `/api/mobile/workouts/${id}`, {})) as {
      workout: Workout;
    }
  ).workout;
}
export async function history(token: string): Promise<WorkoutSummary[]> {
  return (
    (await workoutRequest(token, '/api/mobile/workouts')) as {
      workouts: WorkoutSummary[];
    }
  ).workouts;
}
export async function engagement(
  token: string,
): Promise<{ messages: CoachMessage[]; forms: AssignedForm[] }> {
  return (await workoutRequest(token, '/api/mobile/engagement')) as {
    messages: CoachMessage[];
    forms: AssignedForm[];
  };
}
export async function downloadReport(
  token: string,
  query: Record<string, string>,
  format: 'pdf' | 'csv' = 'pdf',
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(
      `${apiUrl()}/api/mobile/reports?${new URLSearchParams({ ...query, format }).toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      const result = await response.json();
      if (response.status === 401) throw new SessionExpiredError(result.error);
      throw new Error(result.error ?? 'Não foi possível baixar o relatório.');
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    const filename = `jh-team-${query.week ?? query.workoutId}.${format}`;
    const mime = format === 'pdf' ? 'application/pdf' : 'text/csv';
    if (Platform.OS === 'web') {
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      return;
    }
    const file = new File(Paths.cache, filename);
    file.write(bytes);
    if (!(await Sharing.isAvailableAsync()))
      throw new Error(
        'O compartilhamento de arquivos não está disponível neste dispositivo.',
      );
    await Sharing.shareAsync(file.uri, {
      mimeType: mime,
      UTI:
        format === 'pdf'
          ? 'com.adobe.pdf'
          : 'public.comma-separated-values-text',
      dialogTitle: 'Salvar relatório JH Team',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError')
      throw new Error('O download demorou. Tente novamente.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
