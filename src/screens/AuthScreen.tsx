import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorBanner } from '../components/ErrorBanner';

type Props = { navigation: any };
type Tab = 'login' | 'register';

export default function AuthScreen({ navigation }: Props) {
  const login = useStore(s => s.login);
  const register = useStore(s => s.register);
  const isLoading = useStore(s => s.isLoading);
  const error = useStore(s => s.error);
  const setError = useStore(s => s.setError);

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    try {
      await login(email.trim(), password);
      navigation.replace('Onboarding');
    } catch {
      // error set in store
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !name.trim() || !password) return;
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      await register(email.trim(), name.trim(), password);
      navigation.replace('Onboarding');
    } catch {
      // error set in store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LoadingOverlay visible={isLoading} message="Autenticando..." />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <Text style={styles.logoIcon}>📊</Text>
            <Text style={styles.appName}>PopUp Analytics</Text>
            <Text style={styles.tagline}>Comercio transitorio. Datos reales.</Text>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
              onPress={() => { setTab('login'); setError(null); }}
            >
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'register' && styles.tabBtnActive]}
              onPress={() => { setTab('register'); setError(null); }}
            >
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          <View style={styles.form}>
            {tab === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={Colors.subtext} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre completo"
                    placeholderTextColor={Colors.subtext}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.subtext} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor={Colors.subtext}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.subtext} />
                <TextInput
                  style={styles.input}
                  placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                  placeholderTextColor={Colors.subtext}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={tab === 'login' ? handleLogin : handleRegister}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.subtext} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, (!email.trim() || !password || (tab === 'register' && !name.trim())) && styles.disabledButton]}
              onPress={tab === 'login' ? handleLogin : handleRegister}
              disabled={!email.trim() || !password || (tab === 'register' && !name.trim())}
            >
              <Text style={styles.primaryButtonText}>
                {tab === 'login' ? 'Entrar' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {tab === 'login' && (
              <View style={styles.demoHint}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.subtext} />
                <Text style={styles.demoText}>Demo: demo@popup.com / demo1234</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center', paddingVertical: 40 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoIcon: { fontSize: 52, marginBottom: 10 },
  appName: { color: Colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: Colors.subtext, fontSize: 13, marginTop: 6 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.subtext, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: Colors.text },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { color: Colors.subtext, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingVertical: 13,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: { opacity: 0.4 },
  primaryButtonText: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  demoText: { color: Colors.subtext, fontSize: 12 },
});
