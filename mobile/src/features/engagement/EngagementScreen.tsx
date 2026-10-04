import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/features/auth/AuthProvider';
import { engagement, workoutRequest } from '@/features/training/workout-api';
import type { AssignedForm } from '@/features/training/workout-types';
import { weekdays } from '@/features/training/types';
import { trainingStyles as s } from '@/features/training/training-styles';
export function useEngagement() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['engagement', session?.user.studentId],
    enabled: Boolean(session),
    queryFn: () => engagement(session!.token),
    refetchInterval: 60_000,
    staleTime: 0,
  });
}
export function EngagementScreen() {
  const query = useEngagement(),
    { session } = useAuth();
  return (
    <Screen keyboardAware>
      <View style={s.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <AppText style={s.accent}>← Voltar</AppText>
        </Pressable>
        <AppText style={s.eyebrow}>SEU TREINADOR POR PERTO</AppText>
        <AppText variant="title">Mensagens e formulários</AppText>
        {query.isPending ? (
          <Loading label="Abrindo suas mensagens" />
        ) : query.isError ? (
          <AppText style={s.error}>{query.error.message}</AppText>
        ) : (
          <>
            <AppText style={s.title}>Formulários para você</AppText>
            {!query.data.forms.length && (
              <AppText variant="caption">
                Você ainda não recebeu um formulário.
              </AppText>
            )}
            {query.data.forms.map((form) => (
              <FormCard key={form.id} form={form} token={session!.token} />
            ))}
            <AppText style={s.title}>Mensagens do João</AppText>
            {!query.data.messages.length && (
              <AppText variant="caption">
                Suas próximas mensagens aparecerão aqui.
              </AppText>
            )}
            {query.data.messages.map((message) => (
              <View key={message.id} style={s.card}>
                <AppText style={s.eyebrow}>
                  {message.weekday === null
                    ? 'PARA VOCÊ'
                    : weekdays[message.weekday].toLocaleUpperCase()}
                </AppText>
                <AppText style={s.title}>{message.title}</AppText>
                <AppText>{message.body}</AppText>
                <AppText variant="caption">
                  {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                </AppText>
              </View>
            ))}
          </>
        )}
        <Button
          style={s.secondary}
          disabled={query.isFetching}
          label={query.isFetching ? 'Atualizando...' : 'Atualizar mensagens'}
          onPress={() => void query.refetch()}
        />
      </View>
    </Screen>
  );
}
function FormCard({ form, token }: { form: AssignedForm; token: string }) {
  const [answers, setAnswers] = useState<
      Record<string, string | number | null>
    >(form.answers ?? {}),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [open, setOpen] = useState(false);
  const client = useQueryClient();
  async function submit() {
    setError('');
    const parsed: Record<string, string | number | null> = {};
    for (const question of form.questions) {
      const value = answers[question.id];
      if (value === undefined || value === null || value === '') {
        if (question.required) {
          setError(`Responda: ${question.label}`);
          return;
        }
        parsed[question.id] = null;
        continue;
      }
      if (question.type === 'NUMBER' || question.type === 'SCALE') {
        const number = Number(String(value).replace(',', '.'));
        if (
          !Number.isFinite(number) ||
          (question.type === 'SCALE' &&
            (!Number.isInteger(number) || number < 0 || number > 10))
        ) {
          setError(`Confira a resposta: ${question.label}`);
          return;
        }
        parsed[question.id] = number;
      } else parsed[question.id] = value;
    }
    setPending(true);
    try {
      await workoutRequest(token, `/api/mobile/forms/${form.id}`, {
        answers: parsed,
      });
      await client.invalidateQueries({ queryKey: ['engagement'] });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setPending(false);
    }
  }
  return (
    <View style={s.card}>
      <View style={s.row}>
        <AppText style={s.eyebrow}>
          {form.submittedAt ? 'RESPONDIDO ✓' : 'AGUARDANDO VOCÊ'}
        </AppText>
        <AppText variant="caption">
          {new Date(form.assignedAt).toLocaleDateString('pt-BR')}
        </AppText>
      </View>
      <AppText style={s.title}>{form.title}</AppText>
      {form.description && (
        <AppText variant="caption">{form.description}</AppText>
      )}
      <Button
        style={s.secondary}
        label={
          open
            ? 'Fechar'
            : form.submittedAt
              ? 'Ver minhas respostas'
              : 'Responder formulário'
        }
        onPress={() => setOpen((value) => !value)}
      />
      {open &&
        form.questions.map((question) => (
          <View key={question.id} style={{ gap: 10 }}>
            <AppText>
              {question.label}
              {question.required ? ' *' : ''}
            </AppText>
            {form.submittedAt ? (
              <AppText variant="caption">
                {form.answers?.[question.id] ?? 'Sem resposta'}
              </AppText>
            ) : question.type === 'CHOICE' ? (
              question.options.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: answers[question.id] === option,
                  }}
                  onPress={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option,
                    }))
                  }
                  style={[
                    s.chip,
                    answers[question.id] === option && {
                      borderWidth: 1,
                      borderColor: '#D6F582',
                    },
                  ]}
                >
                  <AppText>
                    {answers[question.id] === option ? '●' : '○'} {option}
                  </AppText>
                </Pressable>
              ))
            ) : (
              <TextInput
                accessibilityLabel={question.label}
                style={[
                  s.input,
                  question.type === 'TEXT' && {
                    minHeight: 90,
                    textAlignVertical: 'top',
                  },
                ]}
                value={String(answers[question.id] ?? '')}
                onChangeText={(value) =>
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: value,
                  }))
                }
                editable={!pending}
                keyboardType={
                  question.type === 'TEXT' ? 'default' : 'decimal-pad'
                }
                multiline={question.type === 'TEXT'}
                maxLength={5000}
                placeholder={
                  question.type === 'SCALE' ? 'De 0 a 10' : 'Sua resposta'
                }
                placeholderTextColor="#A6ADA0"
              />
            )}
          </View>
        ))}
      {error && <AppText style={s.error}>{error}</AppText>}
      {open && !form.submittedAt && (
        <Button
          disabled={pending}
          label={pending ? 'Enviando...' : 'Enviar respostas'}
          onPress={() => void submit()}
        />
      )}
    </View>
  );
}
