import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getWorkout,
  saveSet,
  finishWorkout,
  downloadReport,
} from './workout-api';
import { RestTimer, useRestTimer } from './RestTimer';
import type { LoggedSet, WorkoutExercise } from './workout-types';
import { trainingStyles as s } from './training-styles';
export function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { session } = useAuth(),
    client = useQueryClient();
  const [index, setIndex] = useState(0),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [confirm, setConfirm] = useState(false),
    [saving, setSaving] = useState(false);
  const query = useQuery({
    queryKey: ['workout', session?.user.studentId, id],
    enabled: Boolean(session && id),
    queryFn: () => getWorkout(session!.token, id),
  });
  const workout = query.data,
    exercise = workout?.exercises[index];
  const timerActive = useRestTimer((state) => state.endsAt !== null);
  const sets = workout?.exercises.flatMap((ex) => ex.sets) ?? [];
  const completed = sets.filter((set) => set.completed).length;
  async function finish() {
    if (!session || pending || saving) return;
    setPending(true);
    setError('');
    try {
      const next = await finishWorkout(session.token, id);
      client.setQueryData(['workout', session?.user.studentId, id], next);
      await client.invalidateQueries({ queryKey: ['workout-history'] });
      useRestTimer.getState().stop();
      setConfirm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível finalizar.');
    } finally {
      setPending(false);
    }
  }
  async function report() {
    if (!session) return;
    setPending(true);
    setError('');
    try {
      await downloadReport(session.token, { workoutId: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível baixar.');
    } finally {
      setPending(false);
    }
  }
  return (
    <Screen keyboardAware compact bottomInset={!timerActive}>
      <View style={s.content}>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => router.back()}
        >
          <AppText style={s.accent}>← Voltar</AppText>
        </Pressable>
        {query.isPending ? (
          <Loading label="Abrindo seu treino" />
        ) : query.isError ? (
          <>
            <AppText style={s.error}>{query.error.message}</AppText>
            <Button
              label="Tentar novamente"
              onPress={() => void query.refetch()}
            />
          </>
        ) : (
          workout && (
            <>
              <View style={s.row}>
                <AppText style={s.eyebrow}>
                  {workout.finishedAt
                    ? 'TREINO FINALIZADO'
                    : 'SEU TREINO EM ANDAMENTO'}
                </AppText>
                <AppText variant="caption">
                  {completed}/{sets.length} séries
                </AppText>
              </View>
              <AppText style={s.title}>{workout.sessionName}</AppText>
              <AppText variant="caption">{workout.planName}</AppText>
              {workout.planNotes && (
                <View style={s.note}>
                  <AppText variant="caption">OBSERVAÇÕES DA FICHA</AppText>
                  <AppText>{workout.planNotes}</AppText>
                </View>
              )}
              {workout.sessionNotes && (
                <AppText>{workout.sessionNotes}</AppText>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {workout.exercises.map((ex, i) => (
                  <Pressable
                    key={ex.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Exercício ${i + 1}: ${ex.name}`}
                    accessibilityState={{ selected: i === index }}
                    disabled={saving}
                    onPress={() => setIndex(i)}
                    style={[
                      s.chip,
                      i === index && { backgroundColor: '#D6F582' },
                    ]}
                  >
                    <AppText
                      style={i === index ? { color: '#18210B' } : undefined}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
              {exercise && (
                <View key={exercise.id} style={s.content}>
                  <View style={s.card}>
                    <AppText style={s.eyebrow}>
                      EXERCÍCIO {index + 1} DE {workout.exercises.length}
                    </AppText>
                    <AppText style={s.title}>{exercise.name}</AppText>
                    <AppText>
                      {exercise.warmupSets} aquecimento + {exercise.workingSets}{' '}
                      válidas
                    </AppText>
                    <AppText variant="caption">
                      {exercise.prescribedReps} rep · Descanso{' '}
                      {exercise.prescribedRest}
                    </AppText>
                    {exercise.technique !== 'NONE' && (
                      <View style={s.note}>
                        <AppText style={s.accent}>
                          {exercise.technique.replaceAll('_', ' ')}
                        </AppText>
                        {exercise.techniqueDetail && (
                          <AppText>{exercise.techniqueDetail}</AppText>
                        )}
                      </View>
                    )}
                    {exercise.notes && (
                      <View style={[s.note, { padding: 10, gap: 4 }]}>
                        <AppText variant="caption">OBSERVAÇÕES DO JOÃO</AppText>
                        <AppText variant="caption" style={{ color: '#EDEFE7' }}>
                          {exercise.notes}
                        </AppText>
                      </View>
                    )}
                    <AppText variant="caption">
                      {exercise.previous
                        ? `Último treino: ${new Date(exercise.previous.finishedAt).toLocaleDateString('pt-BR')}. As cargas anteriores estão abaixo de cada série.`
                        : 'Seu primeiro registro deste exercício. Vamos criar sua referência.'}
                    </AppText>
                  </View>
                  {exercise.sets.map((set) => (
                    <SetRow
                      key={set.id}
                      set={set}
                      exercise={exercise}
                      workoutId={id}
                      readonly={Boolean(workout.finishedAt)}
                      busy={saving || pending}
                      onSaving={setSaving}
                      token={session!.token}
                      onSaved={(next) =>
                        client.setQueryData(
                          ['workout', session?.user.studentId, id],
                          next,
                        )
                      }
                    />
                  ))}
                  {!workout.finishedAt && (
                    <RestTimer
                      key={exercise.id}
                      owner={`${id}:${exercise.id}`}
                      prescribed={exercise.prescribedRest}
                      seconds={exercise.restSeconds}
                    />
                  )}
                  <View style={s.row}>
                    <Button
                      variant="secondary"
                      style={[s.secondary, { flex: 1 }]}
                      label="← Anterior"
                      disabled={saving || index === 0}
                      onPress={() => setIndex((i) => i - 1)}
                    />
                    <Button
                      style={{ flex: 1 }}
                      label="Próximo →"
                      disabled={
                        saving || index === workout.exercises.length - 1
                      }
                      onPress={() => setIndex((i) => i + 1)}
                    />
                  </View>
                </View>
              )}
              {error && <AppText style={s.error}>{error}</AppText>}
              {workout.finishedAt ? (
                <View style={s.card}>
                  <AppText style={s.title}>Treino registrado.</AppText>
                  <AppText variant="caption">
                    {completed} séries salvas no seu histórico. Baixe o
                    relatório e salve em Arquivos no celular.
                  </AppText>
                  <Button
                    disabled={pending || saving}
                    label={
                      pending ? 'Preparando PDF...' : 'Baixar relatório em PDF'
                    }
                    onPress={() => void report()}
                  />
                  <Button
                    variant="secondary"
                    style={s.secondary}
                    label="Histórico e relatório semanal"
                    onPress={() => router.push('/training-history')}
                  />
                </View>
              ) : confirm ? (
                <View style={s.card}>
                  <AppText style={s.title}>Finalizar o treino?</AppText>
                  <AppText>
                    {completed}/{sets.length} séries registradas.{' '}
                    {completed < sets.length
                      ? 'As séries restantes aparecerão como não registradas no relatório.'
                      : ''}{' '}
                    Salve as séries que estiver editando antes de finalizar.
                  </AppText>
                  <Button
                    disabled={pending || saving}
                    label={pending ? 'Finalizando...' : 'Confirmar finalização'}
                    onPress={() => void finish()}
                  />
                  <Button
                    variant="secondary"
                    style={s.secondary}
                    label="Continuar treinando"
                    onPress={() => setConfirm(false)}
                  />
                </View>
              ) : (
                <Button
                  label="Finalizar treino"
                  disabled={!completed || saving}
                  onPress={() => setConfirm(true)}
                />
              )}
            </>
          )
        )}
      </View>
    </Screen>
  );
}
function SetRow({
  set,
  exercise,
  workoutId,
  readonly,
  token,
  onSaved,
  onSaving,
  busy,
}: {
  set: LoggedSet;
  exercise: WorkoutExercise;
  workoutId: string;
  readonly: boolean;
  token: string;
  busy: boolean;
  onSaving: (value: boolean) => void;
  onSaved: (next: Awaited<ReturnType<typeof saveSet>>) => void;
}) {
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? ''),
    [reps, setReps] = useState(set.reps?.toString() ?? ''),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const previous = exercise.previous?.sets.find(
    (old) => old.kind === set.kind && old.number === set.number,
  );
  const numericWeight = Number(weight.replace(',', '.')),
    numericReps = Number(reps);
  const valid =
    weight.trim() !== '' &&
    reps.trim() !== '' &&
    Number.isFinite(numericWeight) &&
    numericWeight >= 0 &&
    numericWeight <= 99999 &&
    Number.isInteger(numericReps) &&
    numericReps >= 1 &&
    numericReps <= 1000;
  async function save() {
    if (!valid || pending || busy) return;
    setPending(true);
    onSaving(true);
    setError('');
    try {
      const next = await saveSet(
        token,
        workoutId,
        set.id,
        numericWeight,
        numericReps,
      );
      onSaved(next);
      if (exercise.restSeconds)
        useRestTimer
          .getState()
          .start(`${workoutId}:${exercise.id}`, exercise.restSeconds);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível registrar.');
    } finally {
      setPending(false);
      onSaving(false);
    }
  }
  return (
    <View style={[s.card, set.completed && { borderColor: '#657C3A' }]}>
      <View style={s.row}>
        <AppText style={s.eyebrow}>
          {set.kind === 'WARMUP' ? 'AQUECIMENTO' : 'SÉRIE VÁLIDA'} {set.number}
        </AppText>
        <AppText variant="caption">
          {set.completed ? 'Salva ✓' : 'A registrar'}
        </AppText>
      </View>
      {previous && (
        <AppText variant="caption">
          No último treino: {previous.weightKg} kg × {previous.reps} rep
        </AppText>
      )}
      <View style={[s.row, { alignItems: 'flex-end', gap: 8 }]}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="caption">Carga (kg)</AppText>
          <TextInput
            accessibilityLabel={`Carga ${set.kind === 'WARMUP' ? 'aquecimento' : 'válida'} ${set.number}`}
            editable={!readonly && !pending}
            style={s.input}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="caption">Repetições</AppText>
          <TextInput
            accessibilityLabel={`Repetições ${set.kind === 'WARMUP' ? 'aquecimento' : 'válida'} ${set.number}`}
            editable={!readonly && !pending}
            style={s.input}
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
          />
        </View>
        {!readonly && (
          <Button
            disabled={!valid || pending || busy}
            variant={set.completed ? 'secondary' : 'primary'}
            style={[
              { width: 82, paddingHorizontal: 6 },
              set.completed && s.secondary,
            ]}
            label={
              pending ? 'Salvando' : set.completed ? 'Atualizar' : 'Salvar'
            }
            onPress={() => void save()}
          />
        )}
      </View>
      {error && <AppText style={s.error}>{error}</AppText>}
    </View>
  );
}
