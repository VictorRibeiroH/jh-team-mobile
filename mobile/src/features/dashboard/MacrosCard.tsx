import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { useDiet, number } from '@/features/diet/useDiet';

export function MacrosCard({
  detailed = false,
  showHeading = true,
}: {
  detailed?: boolean;
  showHeading?: boolean;
}) {
  const diet = useDiet();
  const goal = diet.data?.plan?.totals;
  const consumed = diet.data?.consumed;
  const macros = [
    {
      name: 'Proteína',
      key: 'protein' as const,
      color: '#D6F582',
      symbol: 'P',
    },
    { name: 'Gordura', key: 'fat' as const, color: '#E8B88A', symbol: 'G' },
    { name: 'Carbo', key: 'carbs' as const, color: '#A8BBE9', symbol: 'C' },
  ].map((m) => ({
    ...m,
    consumed: consumed?.[m.key] ?? 0,
    goal: goal?.[m.key] ?? 0,
  }));
  return (
    <View style={styles.container}>
      {!detailed && showHeading && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver macros do dia"
          onPress={() => router.push('/diet')}
          style={styles.heading}
        >
          <View>
            <AppText style={styles.title}>Macros do dia</AppText>
            <AppText variant="caption">
              Refeições marcadas / dieta do João.
            </AppText>
          </View>
          <AppText style={styles.arrow}>↗</AppText>
        </Pressable>
      )}
      {diet.isError && (
        <AppText variant="caption">{diet.error.message}</AppText>
      )}
      {!goal && (
        <AppText variant="caption">
          {diet.isPending
            ? 'Carregando dieta...'
            : 'João ainda não publicou sua dieta.'}
        </AppText>
      )}
      <View style={[styles.grid, detailed && styles.vertical]}>
        {macros.map((macro) => (
          <View
            key={macro.name}
            style={[styles.card, detailed && styles.detailCard]}
          >
            <View style={styles.top}>
              <View
                style={[styles.symbol, { backgroundColor: macro.color + '20' }]}
              >
                <AppText
                  style={{
                    color: macro.color,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {macro.symbol}
                </AppText>
              </View>
              <AppText variant="caption" style={styles.name}>
                {macro.name}
              </AppText>
            </View>
            <View style={styles.amount}>
              <AppText
                style={[
                  styles.number,
                  detailed && { fontSize: 40, lineHeight: 48 },
                ]}
              >
                {number(macro.consumed)}
              </AppText>
              <AppText variant="caption">g</AppText>
            </View>
            <ProgressBar
              value={macro.goal ? macro.consumed / macro.goal : 0}
              color={macro.color}
            />
            <AppText variant="caption" style={styles.goal}>
              de {number(macro.goal)} g
            </AppText>
            {detailed && (
              <AppText variant="caption">
                {number(Math.max(0, macro.goal - macro.consumed))} g restantes
                da prescrição
              </AppText>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 18 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.6 },
  arrow: { color: colors.accent, fontSize: 26, padding: 8 },
  grid: { flexDirection: 'row', gap: 8 },
  vertical: { flexDirection: 'column', gap: 14 },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailCard: { padding: 24 },
  top: { gap: 8 },
  symbol: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 12 },
  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    flexWrap: 'wrap',
  },
  number: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -1,
  },
  goal: { fontSize: 11 },
});
