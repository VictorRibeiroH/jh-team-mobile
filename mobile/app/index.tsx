import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="caption">BASE DE DESENVOLVIMENTOS</AppText>
        <AppText variant="title">JH Team</AppText>
        <View style={styles.card}>
          <AppText>Ambiente configurado com sucesso.</AppText>
          <AppText variant="caption">Pronto para começar.</AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
