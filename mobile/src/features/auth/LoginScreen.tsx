import { useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { Loading } from '@/components/ui/Loading';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme';

type Feedback = { kind: 'error' | 'notice'; message: string };

export function LoginScreen() {
  const { signIn } = useAuth();
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const [code, setCode] = useState('');
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function submit() {
    if (submitting.current) return;
    if (!code.trim()) {
      setFeedback({
        kind: 'error',
        message: 'Digite o código de acesso que você recebeu.',
      });
      return;
    }
    if (!/^JH-[A-Z]{3}-[A-Z0-9]{4}$/i.test(code.trim())) {
      setFeedback({
        kind: 'error',
        message: 'Confira seu código. Exemplo: JH-VIC-A7K2.',
      });
      return;
    }
    Keyboard.dismiss();
    submitting.current = true;
    setPending(true);
    setFeedback(null);
    try {
      await signIn(code);
      setCode('');
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível entrar. Tente novamente.',
      });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <Screen keyboardAware>
      <View style={styles.content}>
        <Reveal>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.dot} />
              <AppText style={styles.brandText}>JH TEAM</AppText>
            </View>
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>ACESSO DO ALUNO</AppText>
            </View>
          </View>
        </Reveal>
        <View style={styles.body}>
          <Reveal delay={60}>
            <View style={styles.hero}>
              <View
                style={styles.motif}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <View style={[styles.bar, styles.barOne]} />
                <View style={[styles.bar, styles.barTwo]} />
                <View style={[styles.bar, styles.barThree]} />
              </View>
              <AppText variant="caption" style={styles.eyebrow}>
                SEU TREINO. SUA JORNADA.
              </AppText>
              <AppText style={styles.title}>
                Seu próximo
                <AppText style={styles.title}>{'\n'}nível começa</AppText>
                <AppText style={[styles.title, styles.accent]}>
                  {'\n'}aqui.
                </AppText>
              </AppText>
              <AppText style={styles.subtitle}>
                Entre com seu código e dê o próximo passo na sua evolução.
              </AppText>
            </View>
          </Reveal>
          <Reveal delay={140}>
            <View style={styles.form}>
              <View style={styles.formHeading}>
                <AppText style={styles.formTitle}>Vamos começar.</AppText>
                <AppText variant="caption">Um código. Seu acesso.</AppText>
              </View>
              <AppText style={styles.label}>Código de acesso</AppText>
              <View
                style={[
                  styles.inputContainer,
                  focused && styles.inputFocused,
                  feedback?.kind === 'error' && styles.inputError,
                ]}
              >
                <TextInput
                  accessibilityLabel="Código de acesso"
                  accessibilityHint="Digite ou cole o código fornecido pelo seu treinador."
                  value={code}
                  onChangeText={(value) => {
                    setCode(value.trim().toUpperCase());
                    setFeedback(null);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="JH-VIC-A7K2"
                  editable={!pending}
                  maxLength={64}
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.accent}
                  secureTextEntry={!visible}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  returnKeyType="go"
                  submitBehavior="blurAndSubmit"
                  onSubmitEditing={() => void submit()}
                  underlineColorAndroid="transparent"
                  style={styles.input}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    visible ? 'Ocultar código' : 'Mostrar código'
                  }
                  onPress={() => setVisible((current) => !current)}
                  hitSlop={4}
                  style={styles.toggle}
                >
                  <AppText style={styles.toggleText}>
                    {visible ? 'Ocultar' : 'Mostrar'}
                  </AppText>
                </Pressable>
              </View>
              {feedback && (
                <View
                  style={[
                    styles.feedback,
                    feedback.kind === 'error' && styles.errorFeedback,
                  ]}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  <AppText
                    style={[
                      styles.feedbackText,
                      feedback.kind === 'error' && styles.errorText,
                    ]}
                  >
                    {feedback.message}
                  </AppText>
                </View>
              )}
              {pending && <Loading label="Confirmando seu acesso" />}
              <Button
                label={pending ? 'Entrando…' : 'Entrar  ↗'}
                onPress={() => void submit()}
                disabled={pending}
                style={styles.submit}
              />
              <AppText variant="caption" style={styles.hint}>
                Seu treinador fornece o código de acesso. Cole aqui exatamente
                como você recebeu.
              </AppText>
            </View>
          </Reveal>
          <Reveal delay={220}>
            <View style={styles.help}>
              <View style={styles.helpIcon}>
                <AppText style={styles.helpSymbol}>?</AppText>
              </View>
              <View style={styles.helpCopy}>
                <AppText style={styles.helpTitle}>
                  Ainda não tem seu código?
                </AppText>
                <AppText variant="caption">
                  Peça ao seu treinador para liberar seu acesso.
                </AppText>
              </View>
            </View>
          </Reveal>
        </View>
        <AppText variant="caption" style={styles.footer}>
          CONSTÂNCIA CONSTRÓI RESULTADOS.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  brandText: { fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.muted,
    fontWeight: '500',
  },
  body: { flexGrow: 1, justifyContent: 'center', gap: 26 },
  hero: { gap: 16 },
  motif: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 48,
    marginBottom: 10,
  },
  bar: { width: 12, borderRadius: 4, transform: [{ skewX: '-12deg' }] },
  barOne: { height: 24, backgroundColor: '#D6F58238' },
  barTwo: { height: 36, backgroundColor: '#D6F58280' },
  barThree: { height: 48, backgroundColor: colors.accent },
  eyebrow: { fontSize: 10, letterSpacing: 1.8 },
  title: {
    fontSize: 43,
    lineHeight: 47,
    fontWeight: '600',
    letterSpacing: -1.7,
  },
  accent: { color: colors.accent },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 330,
  },
  form: {
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 14,
  },
  formHeading: { gap: 3, marginBottom: 8 },
  formTitle: { fontSize: 22, fontWeight: '600', letterSpacing: -0.5 },
  label: { fontSize: 13, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 58,
  },
  inputFocused: { borderColor: colors.accent },
  inputError: { borderColor: '#F0ACA3' },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 4,
  },
  toggle: {
    minHeight: 48,
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  toggleText: { fontSize: 11, color: colors.muted },
  submit: { minHeight: 56, borderRadius: 14, marginTop: 2 },
  hint: { fontSize: 11, lineHeight: 17 },
  feedback: { backgroundColor: '#D6F58212', padding: 12, borderRadius: 12 },
  feedbackText: { color: colors.accent, fontSize: 13, lineHeight: 20 },
  errorFeedback: { backgroundColor: '#F0ACA312' },
  errorText: { color: '#F0ACA3' },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  helpIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpSymbol: { fontSize: 16, color: colors.muted },
  helpCopy: { flex: 1, gap: 3 },
  helpTitle: { fontSize: 13, fontWeight: '500' },
  footer: {
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 1.5,
    paddingVertical: 8,
  },
});
