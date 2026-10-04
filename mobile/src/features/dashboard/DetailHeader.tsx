import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme';

export function DetailHeader({
  title,
  subtitle,
  compact = false,
}: {
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.header, compact && { marginBottom: 0, gap: 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar para início"
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace('/home')
        }
        style={[styles.back, compact && { marginBottom: 0 }]}
      >
        <AppText style={styles.arrow}>←</AppText>
      </Pressable>
      <AppText variant="caption" style={styles.tag}>
        SEU DIA, EM EQUILÍBRIO
      </AppText>
      <AppText
        style={[styles.title, compact && { fontSize: 30, lineHeight: 36 }]}
      >
        {title}
      </AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { gap: 12, marginBottom: 28 },
  back: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  arrow: { fontSize: 24 },
  tag: { color: colors.accent, fontSize: 10, letterSpacing: 2 },
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '600',
    letterSpacing: -1.5,
  },
  subtitle: { color: colors.muted, fontSize: 15 },
});
