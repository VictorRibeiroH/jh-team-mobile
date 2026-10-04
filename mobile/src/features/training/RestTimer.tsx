import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { trainingStyles as s } from './training-styles';
import { useRestTimer } from './rest-timer-store';
export { useRestTimer } from './rest-timer-store';
export function RestTimer({
  owner,
  prescribed,
  seconds,
}: {
  owner: string;
  prescribed: string;
  seconds: number | null;
}) {
  const { start, endsAt } = useRestTimer();
  const [custom, setCustom] = useState(String(seconds ?? 60));
  const duration = Number(custom);
  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <AppText style={s.eyebrow}>DESCANSO</AppText>
          <AppText variant="caption">
            {prescribed} · automático ao salvar
          </AppText>
        </View>
        <TextInput
          accessibilityLabel="Tempo de descanso em segundos"
          style={[s.input, { width: 62, paddingHorizontal: 8 }]}
          keyboardType="number-pad"
          value={custom}
          onChangeText={setCustom}
        />
        <Button
          style={{ paddingHorizontal: 12 }}
          label={endsAt ? 'Reiniciar' : 'Iniciar'}
          disabled={
            !Number.isInteger(duration) || duration < 1 || duration > 3600
          }
          onPress={() => start(owner, duration)}
        />
      </View>
    </View>
  );
}
