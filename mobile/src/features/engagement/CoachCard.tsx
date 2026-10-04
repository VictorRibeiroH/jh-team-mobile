import { View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { trainingStyles as s } from '@/features/training/training-styles';
import { useEngagement } from './EngagementScreen';
export function CoachCard() {
  const query = useEngagement();
  const pending =
    query.data?.forms.filter((form) => !form.submittedAt).length ?? 0;
  const messages =
    query.data?.messages.filter(
      (message) =>
        message.weekday === null || message.weekday === new Date().getDay(),
    ) ?? [];
  return (
    <View style={s.card}>
      <AppText style={s.eyebrow}>DO JOÃO PARA VOCÊ</AppText>
      {messages.slice(0, 3).map((message) => (
        <View key={message.id} style={{ gap: 6 }}>
          <AppText style={s.title}>{message.title}</AppText>
          <AppText>{message.body}</AppText>
        </View>
      ))}
      {!messages.length && (
        <AppText variant="caption">
          Seu treinador por perto, dentro e fora do treino.
        </AppText>
      )}
      {pending > 0 && (
        <AppText style={s.accent}>
          {pending}{' '}
          {pending === 1 ? 'formulário aguardando' : 'formulários aguardando'}{' '}
          sua resposta
        </AppText>
      )}
      <Button
        label="Mensagens e formulários"
        style={s.secondary}
        onPress={() => router.push('/engagement')}
      />
    </View>
  );
}
