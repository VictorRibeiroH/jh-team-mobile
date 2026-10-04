import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { useEngagement } from '@/features/engagement/EngagementScreen';
import { useTraining } from './useTraining';
import { dayTraining, weekdays } from './types';
export function TodayTrainingModal() {
  const query = useTraining();
  const inbox = useEngagement();
  const [dismissed, setDismissed] = useState(false);
  const day = new Date().getDay();
  const { rest, session } = dayTraining(query.data, day);
  return (
    <Modal
      visible={!dismissed && query.isSuccess}
      transparent
      animationType="fade"
      onRequestClose={() => setDismissed(true)}
    >
      <View style={styles.overlay}>
        <ScrollView
          style={styles.card}
          contentContainerStyle={{ padding: 26, gap: 18 }}
        >
          <AppText variant="caption" style={styles.accent}>
            {weekdays[day].toLocaleUpperCase()} · HOJE
          </AppText>
          <AppText style={styles.symbol}>{rest ? '☾' : '↗'}</AppText>
          <AppText variant="title">
            {rest
              ? 'Hoje é descanso.'
              : session
                ? session.name
                : 'Seu dia, seu ritmo.'}
          </AppText>
          <AppText>
            {rest
              ? 'Recupere as energias. O descanso também faz parte da sua evolução.'
              : session
                ? `${session.exercises.length} ${session.exercises.length === 1 ? 'exercício' : 'exercícios'} na sua ficha de hoje.`
                : query.data
                  ? 'O João ainda não definiu o treino deste dia.'
                  : 'Sua ficha ainda não foi ativada pelo João.'}
          </AppText>
          {session?.notes && (
            <AppText variant="caption">{session.notes}</AppText>
          )}
          {inbox.data?.messages
            .filter(
              (message) => message.weekday === null || message.weekday === day,
            )
            .slice(0, 2)
            .map((message) => (
              <View key={message.id}>
                <AppText style={styles.accent}>{message.title}</AppText>
                <AppText variant="caption">{message.body}</AppText>
              </View>
            ))}
          <Button
            label={session ? 'Ver treino de hoje' : 'Ver meus treinos'}
            onPress={() => {
              setDismissed(true);
              router.push(
                session
                  ? { pathname: '/training', params: { sessionId: session.id } }
                  : '/training',
              );
            }}
          />
          <Button
            label="Continuar para o início"
            onPress={() => setDismissed(true)}
            style={styles.secondary}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000B8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  accent: { color: colors.accent },
  symbol: { fontSize: 44, color: colors.accent },
  secondary: { backgroundColor: colors.border },
});
