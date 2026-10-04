import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Loading({
  label = 'Preparando seu ritmo',
}: {
  label?: string;
}) {
  const [phase] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      phase.setValue(0.5);
      return;
    }
    const animation = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [phase, reduced]);
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <View style={styles.mark}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                opacity: phase.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange:
                    index === 0
                      ? [1, 0.45, 0.3, 0.45, 1]
                      : index === 1
                        ? [0.4, 1, 0.4, 0.3, 0.4]
                        : [0.3, 0.4, 1, 0.4, 0.3],
                }),
                transform: [
                  {
                    scaleY: phase.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: index === 1 ? [0.6, 1, 0.6] : [1, 0.6, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
      <AppText style={styles.label}>{label}</AppText>
      <AppText variant="caption">
        Um instante. Seu dia está tomando forma.
      </AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 56, gap: 12 },
  mark: {
    flexDirection: 'row',
    gap: 6,
    height: 52,
    alignItems: 'center',
    marginBottom: 12,
  },
  bar: {
    width: 10,
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  label: { fontWeight: '600' },
});
