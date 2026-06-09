import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';

type Props = { navigation: any };

export default function StandJoinScreen({ navigation }: Props) {
  const joinEvent = useStore((s) => s.joinEvent);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    const success = joinEvent(trimmed);
    setLoading(false);
    if (success) {
      navigation.navigate('StandSetup');
    } else {
      Alert.alert(
        'Código no encontrado',
        'El código ingresado no es válido. Verifica con el organizador del evento.',
        [{ text: 'Intentar de nuevo' }]
      );
    }
  };

  const handleFreeMode = () => {
    joinEvent('FREE');
    navigation.navigate('StandSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unirse a Evento</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Text style={styles.bigIcon}>🏪</Text>
          </View>

          <Text style={styles.title}>Ingresa el código de acceso</Text>
          <Text style={styles.subtitle}>
            El organizador del evento te proporcionará un código como{' '}
            <Text style={styles.codeExample}>BAZAR-VERDE-2026</Text>
          </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="BAZAR-VERDE-2026"
            placeholderTextColor={Colors.subtext}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />

          <TouchableOpacity
            style={[styles.primaryButton, (!code.trim() || loading) && styles.disabledButton]}
            onPress={handleJoin}
            disabled={!code.trim() || loading}
          >
            <Ionicons name="enter-outline" size={18} color={Colors.text} />
            <Text style={styles.primaryButtonText}>
              {loading ? 'Verificando...' : 'Unirme al Evento'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.freeButton} onPress={handleFreeMode}>
            <Ionicons name="flash-outline" size={18} color={Colors.accent} />
            <Text style={styles.freeButtonText}>Usar Modo Gratuito</Text>
          </TouchableOpacity>

          <View style={styles.freeInfo}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.subtext} />
            <Text style={styles.freeInfoText}>
              El modo gratuito permite hasta 50 transacciones sin necesidad de unirse a un evento
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  bigIcon: { fontSize: 40 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: Colors.subtext, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  codeExample: { color: Colors.primary, fontWeight: '700' },
  codeInput: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    width: '100%',
    letterSpacing: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  disabledButton: { opacity: 0.4 },
  primaryButtonText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.subtext, fontSize: 13 },
  freeButton: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  freeButtonText: { color: Colors.accent, fontSize: 16, fontWeight: '700' },
  freeInfo: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  freeInfoText: { color: Colors.subtext, fontSize: 12, flex: 1, lineHeight: 18 },
});
