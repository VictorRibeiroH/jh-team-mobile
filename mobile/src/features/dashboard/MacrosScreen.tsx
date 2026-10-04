import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Reveal } from '@/components/ui/Reveal';
import { MacrosCard } from './MacrosCard';
import { DetailHeader } from './DetailHeader';

export function MacrosScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Reveal>
          <DetailHeader
            title="Macros do dia"
            subtitle="Proteína, gordura e carboidratos em um só lugar."
          />
        </Reveal>
        <Reveal delay={100}>
          <MacrosCard detailed />
        </Reveal>
        <AppText variant="caption" style={styles.note}>
          Os valores consumidos somam as refeições marcadas como feitas. As
          metas vêm da sua dieta.
        </AppText>
        <Button
          label="Ver minhas refeições"
          onPress={() => router.push('/diet')}
        />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  note: { marginTop: 24, paddingBottom: 16 },
});
