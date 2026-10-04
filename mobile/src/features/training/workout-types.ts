export type LoggedSet = {
  id: string;
  kind: 'WARMUP' | 'WORKING';
  number: number;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
};
export type WorkoutExercise = {
  id: string;
  name: string;
  warmupSets: number;
  workingSets: number;
  prescribedReps: string;
  prescribedRest: string;
  restSeconds: number | null;
  technique: string;
  techniqueDetail: string | null;
  notes: string | null;
  sets: LoggedSet[];
  previous: {
    finishedAt: string;
    sets: Omit<LoggedSet, 'id' | 'completed'>[];
  } | null;
};
export type Workout = {
  id: string;
  sessionName: string;
  planName: string;
  planNotes: string | null;
  sessionNotes: string | null;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
};
export type WorkoutSummary = {
  id: string;
  sessionName: string;
  planName: string;
  startedAt: string;
  finishedAt: string | null;
  localDate: string;
};
export type Question = {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'SCALE' | 'CHOICE';
  required: boolean;
  options: string[];
};
export type AssignedForm = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  answers: Record<string, string | number | null> | null;
  assignedAt: string;
  submittedAt: string | null;
};
export type CoachMessage = {
  id: string;
  title: string;
  body: string;
  weekday: number | null;
  createdAt: string;
};
