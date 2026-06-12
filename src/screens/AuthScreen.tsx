import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
  FadeIn, FadeInDown, FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, R, F, S } from '../theme/colors';
import { useStore } from '../store/useStore';

const { height } = Dimensions.get('window');
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
  const tabAnim = useSharedValue(0);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    tabAnim.value = withSpring(t === 'login' ? 0 : 1, { damping: 18, stiffness: 300 });
    Haptics.selectionAsync();
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(tabAnim.value * 140, { damping: 18, stiffness: 300 }) }],
  }));

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Rellena todos los campos'); return; }
    if (tab === 'register' && !name.trim()) { setError('Introduce tu nombre'); return; }
    setLoading(true);
    try {
      if (tab === 'login') await login(email.trim(), password);
      else await register(email.trim(), name.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Onboarding');
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.hero}>
            <View style={styles.iconRing}>
              <Text style={styles.heroIcon}>📊</Text>
            </View>
            <Text style={styles.heroTitle}>PopUp Analytics</Text>
            <Text style={styles.heroSub}>Infraestructura financiera para el comercio de calle</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View entering={FadeInUp.delay(150).duration(500).springify()} style={styles.card}>

            {/* Tab switcher */}
            <View style={styles.tabTrack}>
              <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
              {(['login', 'register'] as Tab[]).map((t) => (
                <TouchableOpacity key={t} style={styles.tabBtn} onPress={() => switchTab(t)} activeOpacity={0.8}>
                  <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                    {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.fields}>
              {tab === 'register' && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <FieldGroup label="Nombre">
                    <TextInput style={styles.textInput} placeholder="Tu nombre completo" placeholderTextColor={Colors.label4} value={name} onChangeText={setName} autoCapitalize="words" />
                  </FieldGroup>
                </Animated.View>
              )}

              <FieldGroup label="Email">
                <TextInput style={styles.textInput} placeholder="correo@ejemplo.com" placeholderTextColor={Colors.label4} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </FieldGroup>

              <FieldGroup label="Contraseña">
                <View style={styles.passRow}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Mínimo 6 caracteres" placeholderTextColor={Colors.label4} value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn} hitSlop={12}>
                    <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.label3} />
                  </TouchableOpacity>
                </View>
              </FieldGroup>
            </View>

            {!!error && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color={Colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit} disabled={loading} activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitLabel}>{tab === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>
              }
            </TouchableOpacity>

            <View style={styles.demoRow}>
              <Text style={styles.demoText}>Demo: </Text>
              <Text style={styles.demoCode}>demo@example.com / password123</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: S.xl },

  hero: { alignItems: 'center', marginBottom: 36 },
  iconRing: {
    width: 80, height: 80, borderRadius: R.xl,
    backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.sep,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 24,
  },
  heroIcon: { fontSize: 38 },
  heroTitle: { fontSize: F.title1, fontWeight: F.bold, color: Colors.label1, letterSpacing: -0.5 },
  heroSub: { fontSize: F.footnote, color: Colors.label3, textAlign: 'center', marginTop: 6, maxWidth: 260 },

  card: {
    backgroundColor: Colors.bg2, borderRadius: R.xl,
    borderWidth: 1, borderColor: Colors.sep, padding: 24,
  },

  tabTrack: {
    flexDirection: 'row', backgroundColor: Colors.bg1, borderRadius: R.md,
    padding: 3, marginBottom: 24, position: 'relative',
  },
  tabIndicator: {
    position: 'absolute', top: 3, left: 3, width: 140, height: '100%',
    backgroundColor: Colors.bg3, borderRadius: R.sm, marginVertical: -3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', zIndex: 1 },
  tabLabel: { fontSize: F.footnote, fontWeight: F.medium, color: Colors.label3 },
  tabLabelActive: { color: Colors.label1, fontWeight: F.semibold },

  fields: { marginBottom: 4 },
  fieldLabel: { fontSize: F.caption, fontWeight: F.semibold, color: Colors.label3, marginBottom: 6, letterSpacing: 0.4 },
  fieldContainer: {
    backgroundColor: Colors.bg3, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.sep, paddingHorizontal: 14,
  },
  textInput: { color: Colors.label1, fontSize: F.body, paddingVertical: 13 },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: 10 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.redSoft, borderRadius: R.sm,
    padding: 10, marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: F.caption, color: Colors.red },

  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: R.md,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16,
  },
  submitLabel: { fontSize: F.body, fontWeight: F.semibold, color: '#fff', letterSpacing: 0.2 },

  demoRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  demoText: { fontSize: F.caption, color: Colors.label4 },
  demoCode: { fontSize: F.caption, color: Colors.label3 },
});
