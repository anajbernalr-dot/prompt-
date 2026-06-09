import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';

type Props = { navigation: any };

export default function OrganizerSetupScreen({ navigation }: Props) {
  const createEvent = useStore((s) => s.createEvent);

  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxStands, setMaxStands] = useState('10');
  const [commissionRate, setCommissionRate] = useState('15');
  const [standCost, setStandCost] = useState('500');
  const [planType, setPlanType] = useState<'starter' | 'growth' | 'macro'>('starter');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleCreate = () => {
    if (!eventName.trim() || !location.trim()) {
      Alert.alert('Error', 'Por favor completa nombre y ubicación del evento.');
      return;
    }
    const code = createEvent({
      name: eventName.trim(),
      location: location.trim(),
      date,
      maxStands: parseInt(maxStands) || 10,
      commissionRate: parseFloat(commissionRate) / 100,
      standCost: parseFloat(standCost) || 0,
      planType,
    });
    setCreatedCode(code);
  };

  const handleContinue = () => {
    navigation.navigate('OrganizerDashboard');
  };

  if (createdCode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>¡Evento Creado!</Text>
          <Text style={styles.successSubtitle}>Comparte este código con los puestos</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{createdCode}</Text>
          </View>

          <Text style={styles.codeHint}>
            Los stands deberán ingresar este código al unirse al evento
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Ir al Panel de Organizador</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Evento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Información del Evento</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre del Evento *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Bazar de Verano 2026"
            placeholderTextColor={Colors.subtext}
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ubicación *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Parque Central, CDMX"
            placeholderTextColor={Colors.subtext}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-06-15"
            placeholderTextColor={Colors.subtext}
            value={date}
            onChangeText={setDate}
          />
        </View>

        <Text style={styles.sectionTitle}>Configuración Financiera</Text>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Comisión %</Text>
            <TextInput
              style={styles.input}
              placeholder="15"
              placeholderTextColor={Colors.subtext}
              value={commissionRate}
              onChangeText={setCommissionRate}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Costo del Stand $</Text>
            <TextInput
              style={styles.input}
              placeholder="500"
              placeholderTextColor={Colors.subtext}
              value={standCost}
              onChangeText={setStandCost}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Máximo de Stands</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            placeholderTextColor={Colors.subtext}
            value={maxStands}
            onChangeText={setMaxStands}
            keyboardType="number-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Plan del Evento</Text>

        {(['starter', 'growth', 'macro'] as const).map((plan) => (
          <TouchableOpacity
            key={plan}
            style={[styles.planOption, planType === plan && styles.planOptionSelected]}
            onPress={() => setPlanType(plan)}
          >
            <View style={styles.planInfo}>
              <Text style={styles.planName}>
                {plan === 'starter' ? '🌱 Starter' : plan === 'growth' ? '🚀 Growth' : '🏆 Macro'}
              </Text>
              <Text style={styles.planDesc}>
                {plan === 'starter'
                  ? 'Hasta 10 stands, reportes básicos'
                  : plan === 'growth'
                  ? 'Hasta 50 stands, exportación CSV'
                  : 'Sin límite, reportes avanzados'}
              </Text>
            </View>
            {planType === plan && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.primaryButton, (!eventName.trim() || !location.trim()) && styles.disabledButton]}
          onPress={handleCreate}
          disabled={!eventName.trim() || !location.trim()}
        >
          <Ionicons name="flash" size={18} color={Colors.text} />
          <Text style={styles.primaryButtonText}>Crear Evento</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  scrollContent: { padding: 16, gap: 4 },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  fieldGroup: { marginBottom: 12 },
  label: { color: Colors.subtext, fontSize: 13, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row' },
  planOption: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planOptionSelected: { borderColor: Colors.primary },
  planInfo: { flex: 1 },
  planName: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  planDesc: { color: Colors.subtext, fontSize: 12 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: { opacity: 0.4 },
  primaryButtonText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  // Success styles
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { color: Colors.text, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  successSubtitle: { color: Colors.subtext, fontSize: 15, marginBottom: 28, textAlign: 'center' },
  codeBox: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  codeText: { color: Colors.primary, fontSize: 26, fontWeight: '800', letterSpacing: 2 },
  codeHint: { color: Colors.subtext, fontSize: 13, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
});
