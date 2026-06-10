import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';

type Tab = 'login' | 'register';

export default function AuthScreen({ navigation }: { navigation: any }) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Rellena todos los campos'); return; }
    if (tab === 'register' && !name.trim()) { setError('Introduce tu nombre'); return; }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), name.trim(), password);
      }
      navigation.replace('Onboarding');
    } catch (e: any) {
      setError(e.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <Text style={styles.logo}>📊</Text>
            <Text style={styles.appName}>PopUp Analytics</Text>
            <Text style={styles.tagline}>Infraestructura financiera para el comercio de calle</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabs}>
              {(['login', 'register'] as Tab[]).map((t) => (
                <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => { setTab(t); setError(''); }}>
                  <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                    {t === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {tab === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={Colors.subtext} value={name} onChangeText={setName} autoCapitalize="words" />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor={Colors.subtext} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passRow}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Mínimo 6 caracteres" placeholderTextColor={Colors.subtext} value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.subtext} />
                </TouchableOpacity>
              </View>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{tab === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>}
            </TouchableOpacity>

            <Text style={styles.demo}>Demo: demo@example.com / password123</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 56 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.text, marginTop: 8 },
  tagline: { fontSize: 13, color: Colors.subtext, textAlign: 'center', marginTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 24 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, color: Colors.subtext, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, color: Colors.subtext, marginBottom: 6 },
  input: { backgroundColor: Colors.background, color: Colors.text, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#2a2a3a' },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.danger + '22', borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText: { color: Colors.danger, fontSize: 13, flex: 1 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demo: { textAlign: 'center', color: Colors.subtext, fontSize: 12, marginTop: 16 },
});
