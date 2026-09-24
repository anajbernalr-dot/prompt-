import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/Fields';
import { BackButton } from '@/components/Header';
import { Burst } from '@/components/illustrations';
import { SocialButtons } from '@/components/onboarding/SocialButtons';
import { TextLink } from '@/components/onboarding/TextLink';
import {
  hasErrors,
  validateEmail,
  validateName,
  validatePassword,
  type AuthErrors,
} from '@/components/onboarding/validate';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/Typography';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

export default function SignupScreen() {
  const signUp = useAppStore((s) => s.signUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthErrors>({});
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const submit = () => {
    const next: AuthErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    if (hasErrors(next)) return;
    // The auth guard in the root layout moves us to /connect.
    signUp({ name, email });
  };

  const clear = (key: keyof AuthErrors) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <Screen keyboard>
      <View style={styles.top}>
        <BackButton fallback="/welcome" />
        <Burst width={50} style={styles.burst} />
      </View>

      <AppText variant="h1" accessibilityRole="header" style={styles.title}>
        Crea tu cuenta
      </AppText>
      <AppText variant="bodyLg" color={colors.inkSoft} style={styles.intro}>
        Así podremos guardar tus planes, recomendaciones y amigos.
      </AppText>

      <View style={styles.form}>
        <TextField
          label="Nombre completo"
          placeholder="Ana Julia"
          value={name}
          onChangeText={(t) => {
            setName(t);
            clear('name');
          }}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
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
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <Button label="Crear cuenta" onPress={submit} style={styles.cta} />

      <View style={styles.social}>
        <SocialButtons />
      </View>

      <TextLink label="Ya tengo cuenta" onPress={() => router.replace('/login')} style={styles.link} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  burst: { marginTop: 18, marginRight: -4, transform: [{ rotate: '8deg' }] },
  title: { fontSize: 38, lineHeight: 44, letterSpacing: -0.8 },
  intro: { marginTop: 10, maxWidth: 340 },
  form: { gap: 18, marginTop: 26 },
  cta: { marginTop: 28 },
  social: { marginTop: 24 },
  link: { marginTop: 18 },
});
