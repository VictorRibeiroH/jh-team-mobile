import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Reveal } from '@/components/ui/Reveal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { DetailHeader } from './DetailHeader';
import { demoWaterGoal, liters } from './demo';
import { useHydration } from './useHydration';

export function WaterScreen() {
  const { water, addWater, reset } = useHydration();
  const progress = Math.min(water / demoWaterGoal, 1);
  return (
    <Screen>
      <View style={styles.content}>
        <Reveal>
          <DetailHeader
            title="Seu momento água."
            subtitle="Uma pausa. Um gole. Mais equilíbrio."
          />
        </Reveal>
        <Reveal delay={100}>
          <View style={styles.card}>
            <View
              style={styles.vessel}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <View style={[styles.water, { height: `${progress * 100}%` }]} />
              <View style={styles.shine} />
              <AppText style={styles.percent}>
                {Math.round((water / demoWaterGoal) * 100)}%
              </AppText>
            </View>
            <AppText style={styles.amount}>
              {liters(water)} <AppText style={styles.unit}>L</AppText>
            </AppText>
            <AppText variant="caption">
              de {liters(demoWaterGoal)} L · meta demonstrativa
            </AppText>
            <View style={styles.track}>
              <ProgressBar value={progress} color={colors.water} />
            </View>
          </View>
        </Reveal>
        <Reveal delay={180}>
          <View style={styles.controls}>
            <AppText style={styles.title}>Adicionar água</AppText>
            <View style={styles.buttons}>
              {[250, 500].map((ml) => (
                <Pressable
                  key={ml}
                  accessibilityRole="button"
                  accessibilityLabel={`Adicionar ${ml} mililitros na prévia`}
                  onPress={() => addWater(ml)}
                  style={({ pressed }) => [
                    styles.button,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <AppText style={styles.buttonLabel}>+ {ml} ml</AppText>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={reset}
              style={styles.reset}
            >
              <AppText variant="caption">Restaurar demonstração</AppText>
            </Pressable>
          </View>
        </Reveal>
        <AppText variant="caption" style={styles.note}>
          Prévia interativa. Os valores ficam apenas nesta sessão e não são
          salvos. A meta não é uma recomendação individual.
        </AppText>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 24 },
  card: {
    backgroundColor: colors.waterSurface,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#34505C',
  },
  vessel: {
    width: 140,
    height: 170,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#A7DDF480',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  water: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#A7DDF460',
  },
  shine: {
    position: 'absolute',
    left: 15,
    top: 15,
    width: 6,
    height: 65,
    borderRadius: 5,
    backgroundColor: '#FFFFFF30',
  },
  percent: { fontSize: 30, fontWeight: '600' },
  amount: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '600',
    letterSpacing: -2,
  },
  unit: { fontSize: 24, color: colors.water },
  track: { width: '100%', marginTop: 16 },
  controls: { gap: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
    backgroundColor: colors.water,
    borderRadius: 18,
    minHeight: 56,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { fontWeight: '600', color: '#152D38' },
  reset: { alignSelf: 'center', padding: 8 },
  note: { paddingBottom: 20 },
});
