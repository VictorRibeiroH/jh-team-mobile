import { router } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Reveal } from '@/components/ui/Reveal';
import { colors } from '@/theme';
import { MacrosCard } from './MacrosCard';
import { WaterCard } from './WaterCard';
import { CoachCard } from '@/features/engagement/CoachCard';
import { WeekSchedule } from './WeekSchedule';

export function HomeScreen() {
  const { session, signOut } = useAuth();
  const date = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });
  return (
    <Screen>
      <View style={styles.content}>
        <Reveal>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandDot} />
              <AppText style={styles.brandText}>JH TEAM</AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair do aplicativo"
              onPress={() => void signOut()}
              style={styles.avatar}
            >
              <AppText style={styles.avatarText}>Sair</AppText>
            </Pressable>
          </View>
          <View style={styles.hero}>
            <AppText variant="caption" style={styles.eyebrow}>
              {date.toLocaleUpperCase()} · SEU RESUMO
            </AppText>
            <AppText style={styles.headline}>
              Seu ritmo.{'\n'}
              <AppText style={styles.accentHeadline}>Sua evolução.</AppText>
            </AppText>
            <AppText style={styles.subtitle}>
              Olá, {session?.user.name.split(' ')[0]}. Seu próximo passo começa
              hoje.
            </AppText>
          </View>
          <View style={styles.demo}>
            <View style={styles.demoDot} />
            <AppText variant="caption" style={styles.demoText}>
              ÁGUA · DADOS DEMONSTRATIVOS
            </AppText>
          </View>
        </Reveal>
        <Reveal delay={90}>
          <MacrosCard />
        </Reveal>
        <Reveal delay={170}>
          <WaterCard />
        </Reveal>
        <Reveal delay={250}>
          <WeekSchedule />
        </Reveal>
        <Reveal delay={280}>
          <CoachCard />
        </Reveal>
        <View style={styles.footer}>
          <AppText variant="caption" style={styles.footerText}>
            CONSTÂNCIA CONSTRÓI RESULTADOS.
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/loading')}
          >
            <AppText variant="caption" style={styles.preview}>
              Prévia do loading ↗
            </AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 30,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  brandText: { fontWeight: '700', fontSize: 15, letterSpacing: 3 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  hero: { marginTop: 36, gap: 14 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8 },
  headline: {
    fontSize: 44,
    lineHeight: 49,
    letterSpacing: -2,
    fontWeight: '600',
  },
  accentHeadline: {
    fontSize: 44,
    lineHeight: 49,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: -2,
  },
  subtitle: { color: colors.muted, fontSize: 15 },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 24 },
  demoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  demoText: { fontSize: 9, letterSpacing: 1 },
  footer: { alignItems: 'center', gap: 14 },
  footerText: { fontSize: 9, letterSpacing: 1.4 },
  preview: { color: colors.accent, fontSize: 12, padding: 8 },
});
