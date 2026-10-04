import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { demoWaterGoal, liters } from './demo';
import { useHydration } from './useHydration';

export function WaterCard() {
  const water = useHydration((state) => state.water);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Água: ${liters(water)} litros. Ver hidratação`}
      onPress={() => router.push('/water')}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={styles.header}>
        <AppText style={styles.title}>Água</AppText>
        <AppText style={styles.arrow}>↗</AppText>
      </View>
      <View style={styles.row}>
        <View style={styles.content}>
          <View style={styles.amount}>
            <AppText style={styles.number}>{liters(water)}</AppText>
            <AppText style={styles.unit}>/ {liters(demoWaterGoal)} L</AppText>
          </View>
          <AppText variant="caption" style={styles.caption}>
            Um gole de cada vez.
          </AppText>
        </View>
        <View
          style={styles.glass}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View
            style={[
              styles.fill,
              { height: `${Math.min(water / demoWaterGoal, 1) * 100}%` },
            ]}
          />
          <View style={styles.shine} />
        </View>
      </View>
      <ProgressBar value={water / demoWaterGoal} color={colors.water} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.waterSurface,
    borderRadius: 24,
    padding: 22,
    gap: 18,
    borderWidth: 1,
    borderColor: '#34505C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '600', color: colors.water },
  arrow: { color: colors.water, fontSize: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  content: { flex: 1, gap: 5 },
  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  number: {
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -1.5,
    fontWeight: '600',
  },
  unit: { color: colors.water, fontSize: 16 },
  caption: { color: '#AED0DE' },
  glass: {
    width: 48,
    height: 66,
    borderWidth: 2,
    borderColor: '#A7DDF480',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#A7DDF410',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#A7DDF480',
  },
  shine: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 4,
    height: 25,
    borderRadius: 3,
    backgroundColor: '#FFFFFF60',
  },
});
