import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Reveal } from '@/components/ui/Reveal';
import { useTraining } from './useTraining';
import { weekdays } from './types';
import { startWorkout } from './workout-api';
import { trainingStyles as s } from './training-styles';
export function TrainingScreen() {
  const query = useTraining(),
    { session } = useAuth(),
    client = useQueryClient();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const plan = query.data;
  const selected = plan?.sessions.find((item) => item.id === sessionId);
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  async function start() {
    if (!session || !selected || pending) return;
    setPending(true);
    setError('');
    try {
      const workout = await startWorkout(session.token, selected.id);
      client.setQueryData(
        ['workout', session.user.studentId, workout.id],
        workout,
      );
      await client.invalidateQueries({ queryKey: ['workout-history'] });
      router.push({ pathname: '/workout', params: { id: workout.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar.');
    } finally {
      setPending(false);
    }
  }
  return (
    <Screen>
      <View style={s.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <AppText style={s.accent}>← Voltar</AppText>
        </Pressable>
        <AppText style={s.eyebrow}>SUA FICHA · JH TEAM</AppText>
        <AppText variant="title">
          {selected ? selected.name : 'Meus treinos'}
        </AppText>
        <Button
          label="Histórico e relatórios"
          variant="secondary"
          style={s.secondary}
          onPress={() => router.push('/training-history')}
        />
        {query.isPending ? (
          <Loading label="Buscando seus treinos" />
        ) : query.isError ? (
          <>
            <AppText style={s.error}>{query.error.message}</AppText>
            <Button
              label="Tentar novamente"
              onPress={() => void query.refetch()}
            />
          </>
        ) : !plan ? (
          <AppText>O João ainda não ativou uma ficha para você.</AppText>
        ) : (
          <>
            <AppText variant="caption">
              {plan.name} · {plan.startDate.split('-').reverse().join('/')}
            </AppText>
            {plan.notes && (
              <View style={s.note}>
                <AppText variant="caption">OBSERVAÇÕES DA FICHA</AppText>
                <AppText>{plan.notes}</AppText>
              </View>
            )}
            {selected ? (
              <>
                <View style={s.card}>
                  <AppText style={s.title}>Seu próximo passo</AppText>
                  <AppText variant="caption">
                    {selected.exercises.length} exercícios · Registre cada série
                    para acompanhar sua evolução.
                  </AppText>
                  {selected.notes && <AppText>{selected.notes}</AppText>}
                  <Button
                    disabled={pending || !selected.exercises.length}
                    label={
                      pending ? 'Preparando...' : 'Iniciar ou retomar treino'
                    }
                    onPress={() => void start()}
                  />
                  {error && <AppText style={s.error}>{error}</AppText>}
                </View>
                {selected.exercises.map((exercise, index) => (
                  <Reveal key={exercise.id} delay={Math.min(index * 50, 200)}>
                    <View style={s.card}>
                      <AppText style={s.eyebrow}>
                        EXERCÍCIO {String(index + 1).padStart(2, '0')}
                      </AppText>
                      <AppText style={s.title}>{exercise.exerciseName}</AppText>
                      <AppText>
                        {exercise.warmupSets} aquecimento +{' '}
                        {exercise.workingSets} válidas
                      </AppText>
                      <AppText variant="caption">
                        {exercise.reps} rep · Descanso {exercise.rest}
                      </AppText>
                      {exercise.techniqueDetail && (
                        <AppText>{exercise.techniqueDetail}</AppText>
                      )}
                      {exercise.notes && (
                        <AppText variant="caption">{exercise.notes}</AppText>
                      )}
                    </View>
                  </Reveal>
                ))}
                <Button
                  label="Ver todos os treinos"
                  variant="secondary"
                  style={s.secondary}
                  onPress={() => router.replace('/training')}
                />
              </>
            ) : (
              <>
                {!plan.sessions.length && (
                  <AppText>Nenhum treino cadastrado.</AppText>
                )}
                {plan.sessions.map((item, index) => (
                  <Reveal key={item.id} delay={Math.min(index * 70, 280)}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir ${item.name}`}
                      onPress={() =>
                        router.push({
                          pathname: '/training',
                          params: { sessionId: item.id },
                        })
                      }
                      style={s.card}
                    >
                      <View style={s.row}>
                        <AppText style={s.eyebrow}>
                          TREINO {String(index + 1).padStart(2, '0')}
                        </AppText>
                        <AppText style={s.accent}>↗</AppText>
                      </View>
                      <AppText style={s.title}>{item.name}</AppText>
                      <AppText variant="caption">
                        {item.exercises.length} exercícios ·{' '}
                        {item.exercises.reduce(
                          (sum, ex) => sum + ex.workingSets,
                          0,
                        )}{' '}
                        séries válidas
                      </AppText>
                      <AppText style={s.accent}>
                        {plan.weekSchedule
                          .filter((day) => day.sessionId === item.id)
                          .map((day) => weekdays[day.weekday])
                          .join(' · ') || 'Dias ainda não definidos'}
                      </AppText>
                      {item.notes && (
                        <AppText variant="caption">{item.notes}</AppText>
                      )}
                    </Pressable>
                  </Reveal>
                ))}
              </>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}
