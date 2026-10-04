import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { useRestTimer } from './rest-timer-store';
export function FloatingRestTimer() {
  const { endsAt, startedAt, stop } = useRestTimer(),
    [now, setNow] = useState(() => Date.now()),
    insets = useSafeAreaInsets();
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt && useRestTimer.getState().endsAt === endsAt) {
        stop();
        Vibration.vibrate([0, 200, 100, 200]);
      }
    };
    const interval = setInterval(tick, 250);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [endsAt, stop]);
  if (!endsAt) return null;
  const seconds = Math.max(
    0,
    Math.ceil((endsAt - Math.max(now, startedAt ?? now)) / 1000),
  );
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(8, insets.bottom) }]}>
      <View>
        <AppText style={styles.label}>DESCANSO</AppText>
        <AppText style={styles.time}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Encerrar cronômetro de descanso"
        onPress={stop}
        style={styles.button}
      >
        <AppText style={styles.buttonText}>Encerrar</AppText>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: '#D6F582',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
    boxShadow: '0px 5px 20px #00000055',
  },
  label: { fontSize: 9, letterSpacing: 2, color: '#18210B' },
  time: {
    fontSize: 23,
    fontWeight: '600',
    color: '#18210B',
    fontVariant: ['tabular-nums'],
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#18210B',
  },
  buttonText: { color: '#D6F582', fontSize: 13, fontWeight: '600' },
});
