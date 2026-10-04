import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type ButtonProps = Omit<PressableProps, 'children'> & { label: string };

export function Button({ label, disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={(state) => [
        styles.button,
        { opacity: disabled ? 0.4 : state.pressed ? 0.75 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <AppText style={styles.label}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  label: { color: colors.onAccent, fontWeight: '600' },
});
