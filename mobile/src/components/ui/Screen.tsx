import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

type ScreenProps = ViewProps & {
  keyboardAware?: boolean;
  compact?: boolean;
  bottomInset?: boolean;
};

export function Screen({
  children,
  style,
  keyboardAware = false,
  compact = false,
  bottomInset = true,
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView
      {...props}
      edges={
        bottomInset
          ? ['top', 'right', 'bottom', 'left']
          : ['top', 'right', 'left']
      }
      style={[styles.safeArea, style]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        enabled={keyboardAware}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.content, compact && { padding: 16 }]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg },
});
