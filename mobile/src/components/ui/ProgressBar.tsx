import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function ProgressBar({
  value,
  color = colors.accent,
}: {
  value: number;
  color?: string;
}) {
  const [progress] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  const bounded = Math.max(0, Math.min(1, value));
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: bounded,
      duration: reduced ? 0 : 650,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, bounded, reduced]);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(bounded * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  track: {
    height: 5,
    backgroundColor: '#FFFFFF18',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 10 },
});
