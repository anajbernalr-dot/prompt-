import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/Fields';
import { BackButton } from '@/components/Header';
import { Asterisk } from '@/components/illustrations';
import { SocialButtons } from '@/components/onboarding/SocialButtons';
import { TextLink } from '@/components/onboarding/TextLink';
import { hasErrors, validateEmail, validatePassword, type AuthErrors } from '@/components/onboarding/validate';
import { Screen } from '@/components/Screen';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

export default function LoginScreen() {
  const logIn = useAppStore((s) => s.logIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthErrors>({});
  const passwordRef = useRef<TextInput>(null);

  const submit = () => {
    const next: AuthErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    if (hasErrors(next)) return;
    // Existing accounts are already onboarded: the guard sends us straight to the app.
    logIn(email);
  };

  const clear = (key: keyof AuthErrors) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <Screen keyboard>
      <View style={styles.top}>
        <BackButton fallback="/welcome" />
        <Asterisk width={34} style={styles.asterisk} />
      </View>

      <AppText variant="h1" accessibilityRole="header" style={styles.title}>
        Qué bueno verte
      </AppText>
      <AppText variant="bodyLg" color={colors.inkSoft} style={styles.intro}>
        Entra para ver tus planes y tus panas.
      </AppText>

      <View style={styles.form}>
        <TextField
          label="Correo electrónico"
          placeholder="ana.julia@gmail.com"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clear('email');
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Contraseña"
          placeholder="••••••••••••"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clear('password');
          }}
          error={errors.password}
          secureToggle
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>

      <Button
        label="¿Olvidaste tu contraseña?"
        variant="ghost"
        size="sm"
        fullWidth={false}
        style={styles.forgot}
        onPress={() => showToast('Te enviamos un correo para recuperarla', 'mail')}
      />

      <Button label="Entrar" onPress={submit} style={styles.cta} />

      <View style={styles.social}>
        <SocialButtons />
      </View>

      <TextLink
        label="¿No tienes cuenta?"
        strong="Créala aquí"
        onPress={() => router.replace('/signup')}
        style={styles.link}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  asterisk: { marginTop: 14, marginRight: 4, transform: [{ rotate: '-10deg' }] },
  title: { fontSize: 38, lineHeight: 44, letterSpacing: -0.8 },
  intro: { marginTop: 10, maxWidth: 340 },
  form: { gap: 18, marginTop: 26 },
  forgot: { alignSelf: 'flex-end', marginTop: 8, marginRight: -12, height: 40 },
  cta: { marginTop: 12 },
  social: { marginTop: 24 },
  link: { marginTop: 18 },
});
