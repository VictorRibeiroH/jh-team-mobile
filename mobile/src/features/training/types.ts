export type TrainingExercise = {
  id: string;
  exerciseName: string;
  warmupSets: number;
  workingSets: number;
  reps: string;
  rest: string;
  technique: string;
  techniqueDetail: string | null;
  notes: string | null;
};
export type TrainingSession = {
  id: string;
  name: string;
  notes: string | null;
  exercises: TrainingExercise[];
};
export type TrainingPlan = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  sessions: TrainingSession[];
  weekSchedule: { weekday: number; sessionId: string | null }[];
};
export const weekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
export function dayTraining(
  plan: TrainingPlan | null | undefined,
  weekday: number,
) {
  const day = plan?.weekSchedule.find((item) => item.weekday === weekday);
  return {
    rest: Boolean(day && day.sessionId === null),
    session: plan?.sessions.find((session) => session.id === day?.sessionId),
  };
}
