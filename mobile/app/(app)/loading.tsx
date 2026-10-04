import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Loading } from '@/components/ui/Loading';
import { DetailHeader } from '@/features/dashboard/DetailHeader';
import { AppText } from '@/components/ui/AppText';

export default function LoadingPreview() {
  return (
    <Screen>
      <DetailHeader
        title="No seu tempo."
        subtitle="Prévia do componente de loading."
      />
      <View style={styles.content}>
        <Loading />
        <AppText variant="caption" style={styles.note}>
          Esta é uma demonstração da animação; nenhuma requisição está em
          andamento.
        </AppText>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  note: { textAlign: 'center', marginTop: 16 },
});
