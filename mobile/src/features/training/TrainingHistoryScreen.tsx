import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/features/auth/AuthProvider';
import { history, downloadReport } from './workout-api';
import { trainingStyles as s } from './training-styles';
function dateOnly(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function TrainingHistoryScreen() {
  const { session } = useAuth(),
    [offset, setOffset] = useState(0),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const today = new Date(),
    start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const week = dateOnly(start),
    sunday = dateOnly(end);
  const ready = dateOnly(today) >= sunday;
  const query = useQuery({
    queryKey: ['workout-history', session?.user.studentId],
    enabled: Boolean(session),
    queryFn: () => history(session!.token),
    staleTime: 0,
  });
  async function download(format: 'pdf' | 'csv') {
    if (!session || pending) return;
    setPending(true);
    setError('');
    try {
      await downloadReport(
        session.token,
        { week, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        format,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível baixar.');
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
        <AppText style={s.eyebrow}>CONSISTÊNCIA EM NÚMEROS</AppText>
        <AppText variant="title">Seu histórico</AppText>
        <View style={s.card}>
          <AppText style={s.title}>Resumo da semana</AppText>
          <AppText variant="caption">
            {start.toLocaleDateString('pt-BR')} a{' '}
            {end.toLocaleDateString('pt-BR')} · Segunda a domingo
          </AppText>
          <View style={s.row}>
            <Button
              label="← Anterior"
              variant="secondary"
              style={[s.secondary, { flex: 1 }]}
              disabled={pending}
              onPress={() => setOffset((value) => value - 1)}
            />
            <Button
              label="Próxima →"
              variant="secondary"
              style={[s.secondary, { flex: 1 }]}
              disabled={offset === 0 || pending}
              onPress={() => setOffset((value) => value + 1)}
            />
          </View>
          <AppText variant="caption">
            Carga e repetições por série, histórico e comparação da evolução. Só
            treinos finalizados entram no relatório.
          </AppText>
          {!ready && <AppText style={s.accent}>Disponível no domingo.</AppText>}
          <Button
            label={pending ? 'Preparando...' : 'Baixar PDF semanal'}
            disabled={!ready || pending}
            onPress={() => void download('pdf')}
          />
          <Button
            label="Baixar planilha CSV"
            variant="secondary"
            style={s.secondary}
            disabled={!ready || pending}
            onPress={() => void download('csv')}
          />
          {error && <AppText style={s.error}>{error}</AppText>}
        </View>
        <AppText style={s.title}>Treinos registrados</AppText>
        {query.isPending ? (
          <Loading label="Buscando seu histórico" />
        ) : query.isError ? (
          <>
            <AppText style={s.error}>{query.error.message}</AppText>
            <Button
              label="Tentar novamente"
              onPress={() => void query.refetch()}
            />
          </>
        ) : !query.data.length ? (
          <AppText variant="caption">
            Seu primeiro treino registrado aparecerá aqui.
          </AppText>
        ) : (
          query.data.map((workout) => (
            <Pressable
              key={workout.id}
              style={s.card}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/workout',
                  params: { id: workout.id },
                })
              }
            >
              <AppText style={s.eyebrow}>
                {workout.finishedAt ? 'FINALIZADO' : 'EM ANDAMENTO · RETOMAR'}
              </AppText>
              <View style={s.row}>
                <AppText style={s.title}>{workout.sessionName}</AppText>
                <AppText style={s.accent}>↗</AppText>
              </View>
              <AppText variant="caption">
                {workout.planName} ·{' '}
                {new Date(workout.startedAt).toLocaleString('pt-BR')}
              </AppText>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
