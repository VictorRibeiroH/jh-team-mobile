import { StyleSheet } from 'react-native';
import { colors } from '@/theme';
export const trainingStyles = StyleSheet.create({
  content: {
    gap: 12,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingBottom: 12,
  },
  accent: { color: colors.accent },
  muted: { color: colors.muted },
  eyebrow: { color: colors.accent, fontSize: 11, letterSpacing: 2 },
  card: {
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  input: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 17,
    minHeight: 48,
    backgroundColor: colors.background,
  },
  secondary: { backgroundColor: colors.border },
  error: { color: '#FFB4AB' },
  note: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
});
