import { TodayTrainingModal } from '@/features/training/TodayTrainingModal';
import { FloatingRestTimer } from '@/features/training/FloatingRestTimer';
import { View } from 'react-native';
import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'home' };
export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <FloatingRestTimer />
      <TodayTrainingModal />
    </View>
  );
}
