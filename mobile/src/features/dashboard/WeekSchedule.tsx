import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useTraining } from '@/features/training/useTraining';
import { dayTraining } from '@/features/training/types';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Reveal } from '@/components/ui/Reveal';
import { colors } from '@/theme';

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export function WeekSchedule() {
  const query = useTraining();
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(today.getDay());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + index);
    return date;
  });
  const { rest, session } = dayTraining(query.data, selected);
  const selectedDate = days[selected];
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <AppText style={styles.title}>Sua semana</AppText>
        <AppText variant="caption">UM DIA DE CADA VEZ</AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.days}
      >
        {days.map((date, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            accessibilityState={{ selected: selected === index }}
            onPress={() => setSelected(index)}
            style={({ pressed }) => [
              styles.day,
              selected === index && styles.selected,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <AppText
              style={[styles.weekday, selected === index && styles.dark]}
            >
              {weekdays[index]}
            </AppText>
            <AppText style={[styles.date, selected === index && styles.dark]}>
              {date.getDate()}
            </AppText>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === today.getDay()
                      ? selected === index
                        ? colors.onAccent
                        : colors.accent
                      : 'transparent',
                },
              ]}
            />
          </Pressable>
        ))}
      </ScrollView>
      <Reveal key={selected}>
        <View style={styles.empty}>
          <View style={styles.icon}>
            <AppText style={styles.iconText}>↗</AppText>
          </View>
          <View style={styles.copy}>
            <AppText style={styles.emptyTitle}>
              {selected === today.getDay()
                ? 'Seu treino de hoje'
                : `Treino de ${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}`}
            </AppText>
            <AppText variant="caption">
              {query.isPending
                ? 'Carregando...'
                : query.isError
                  ? 'Não foi possível carregar os treinos.'
                  : rest
                    ? 'OFF · Descanso'
                    : session
                      ? session.name
                      : 'Ainda sem treino programado.'}
            </AppText>
            {session && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/training',
                    params: { sessionId: session.id },
                  })
                }
              >
                <AppText style={{ color: colors.accent }}>
                  Abrir treino ↗
                </AppText>
              </Pressable>
            )}
            {query.isError && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void query.refetch()}
              >
                <AppText style={{ color: colors.accent }}>
                  Tentar novamente
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      </Reveal>
      <Button
        label="Ver todos os treinos"
        onPress={() => router.push('/training')}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  section: { gap: 18 },
  heading: { gap: 4 },
  title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.6 },
  days: { gap: 8, paddingVertical: 2 },
  day: {
    minWidth: 43,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  weekday: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  date: { fontSize: 20, fontWeight: '600' },
  dark: { color: colors.onAccent },
  dot: { width: 4, height: 4, borderRadius: 2 },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    backgroundColor: '#D6F58212',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.accent, fontSize: 24 },
  copy: { flex: 1, gap: 4 },
  emptyTitle: { fontWeight: '600', fontSize: 16 },
});
