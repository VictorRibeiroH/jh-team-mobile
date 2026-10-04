import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { DetailHeader } from '@/features/dashboard/DetailHeader';
import { MacrosCard } from '@/features/dashboard/MacrosCard';
import { colors } from '@/theme';
import { useDiet, number, type Meal } from './useDiet';
export function DietScreen() {
  const diet = useDiet();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function toggle(planId: string, mealKey: string, completed: boolean) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await diet.check(planId, mealKey, completed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const plan = diet.data?.plan;
  return (
    <Screen compact>
      <View style={styles.content}>
        <DetailHeader
          compact
          title="Sua dieta"
          subtitle="Sua prescrição. Uma refeição de cada vez."
        />
        {diet.isPending ? (
          <Loading label="Carregando suas refeições" />
        ) : diet.isError ? (
          <>
            <AppText>{diet.error.message}</AppText>
            <Button
              label="Tentar novamente"
              onPress={() => void diet.refetch()}
            />
          </>
        ) : !plan ? (
          <View style={styles.card}>
            <AppText style={styles.title}>Sua dieta chega por aqui.</AppText>
            <AppText variant="caption">
              Assim que João publicar sua prescrição, você verá as refeições e
              as quantidades.
            </AppText>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <AppText style={styles.eyebrow}>
                PRESCRITO PELO JOÃO · HOJE
              </AppText>
              <AppText style={styles.title}>{plan.name}</AppText>
              <View style={styles.row}>
                <AppText style={styles.calories}>
                  {Math.round(diet.data!.consumed.kcal)}{' '}
                  <AppText variant="caption">
                    / {Math.round(plan.totals.kcal)} kcal
                  </AppText>
                </AppText>
                <AppText variant="caption">
                  {plan.meals.filter((m) => m.completed).length}/
                  {plan.meals.length} refs
                </AppText>
              </View>
              {plan.notes && <AppText variant="caption">{plan.notes}</AppText>}
            </View>
            <MacrosCard showHeading={false} />
            {error && (
              <AppText accessibilityRole="alert" style={{ color: '#FFB4AB' }}>
                {error}
              </AppText>
            )}
            {plan.meals.map((meal, i) => (
              <View
                key={meal.key}
                style={[styles.card, meal.completed && styles.done]}
              >
                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText style={styles.eyebrow}>
                      REFEIÇÃO {String(i + 1).padStart(2, '0')}
                    </AppText>
                    <AppText style={styles.title}>{meal.name}</AppText>
                  </View>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Marcar ${meal.name} como feita`}
                    accessibilityState={{
                      checked: meal.completed,
                      disabled: busy,
                    }}
                    disabled={busy}
                    style={[
                      styles.check,
                      meal.completed && { backgroundColor: colors.accent },
                    ]}
                    onPress={() =>
                      void toggle(plan.id, meal.key, !meal.completed)
                    }
                  >
                    <AppText
                      style={{
                        color: meal.completed
                          ? colors.background
                          : colors.accent,
                        fontSize: 22,
                      }}
                    >
                      {meal.completed ? '✓' : '○'}
                    </AppText>
                  </Pressable>
                </View>
                <FoodList meal={meal} />
                {meal.notes && (
                  <AppText variant="caption" style={styles.note}>
                    {meal.notes}
                  </AppText>
                )}
                <AppText style={styles.foot}>
                  {meal.completed ? 'REFEIÇÃO FEITA' : 'MARQUE QUANDO FIZER'}
                </AppText>
              </View>
            ))}
          </>
        )}
        {!!diet.data?.previousMeals.length && (
          <View style={styles.card}>
            <AppText style={styles.title}>
              Registros da dieta anterior de hoje
            </AppText>
            <AppText variant="caption">
              Estas refeições continuam no total consumido após a atualização da
              prescrição.
            </AppText>
            {diet.data.previousMeals.map((m) => (
              <View key={m.planId + m.mealKey} style={styles.row}>
                <AppText style={{ flex: 1 }}>{m.name}</AppText>
                <Button
                  style={{ paddingHorizontal: 10 }}
                  label="Desmarcar"
                  disabled={busy}
                  onPress={() => void toggle(m.planId, m.mealKey, false)}
                />
              </View>
            ))}
          </View>
        )}
        <AppText variant="caption">
          Quantidades da parte comestível, em gramas. Confira o preparo
          indicado. Valores nutricionais de referência: TACO/UNICAMP e TBCA/USP.
        </AppText>
      </View>
    </Screen>
  );
}
function FoodList({ meal }: { meal: Meal }) {
  return (
    <View style={{ gap: 10 }}>
      {meal.items.map((item, i) => (
        <View key={i} style={styles.row}>
          <View style={{ flex: 1, gap: 3 }}>
            <AppText style={{ fontSize: 14 }}>{item.name}</AppText>
            {item.unitGrams && (
              <AppText variant="caption" style={{ fontSize: 10 }}>
                Referência: {number(item.unitGrams)} g por {item.unitLabel}
              </AppText>
            )}
          </View>
          <AppText style={{ color: colors.accent, fontSize: 14 }}>
            {item.quantity !== undefined && item.unitLabel
              ? `${number(item.quantity)} ${item.unitLabel}${item.quantity === 1 ? '' : 's'}`
              : `${number(item.grams)} g`}
          </AppText>
        </View>
      ))}
      <View style={styles.nutrients}>
        <AppText variant="caption">
          {Math.round(meal.totals.kcal)} kcal · P {number(meal.totals.protein)}{' '}
          g · C {number(meal.totals.carbs)} g · G {number(meal.totals.fat)} g
        </AppText>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 16,
    paddingBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  done: { borderColor: '#657C3A' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.6 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, color: colors.accent },
  calories: { fontSize: 28, fontWeight: '600' },
  check: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderColor: colors.accent,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutrients: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  note: { backgroundColor: colors.background, padding: 10, borderRadius: 10 },
  foot: { fontSize: 9, letterSpacing: 1.5, color: colors.muted },
});
