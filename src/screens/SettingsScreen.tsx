import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore, Cashier } from '../store/useStore';

type Props = { navigation: any };

export default function SettingsScreen({ navigation }: Props) {
  const currentEvent = useStore((s) => s.currentEvent);
  const currentStand = useStore((s) => s.currentStand);
  const currentUser = useStore((s) => s.currentUser);
  const userRole = useStore((s) => s.userRole);
  const plan = useStore((s) => s.plan);
  const activeCashier = useStore((s) => s.activeCashier);
  const addCashier = useStore((s) => s.addCashier);
  const removeCashier = useStore((s) => s.removeCashier);
  const setActiveCashier = useStore((s) => s.setActiveCashier);
  const leaveEvent = useStore((s) => s.leaveEvent);
  const resetAll = useStore((s) => s.resetAll);

  const [showAddCashier, setShowAddCashier] = useState(false);
  const [cashierName, setCashierName] = useState('');
  const [cashierPin, setCashierPin] = useState('');

  const cashiers = currentStand?.cashiers ?? [];

  const handleAddCashier = () => {
    if (!cashierName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del cajero.');
      return;
    }
    addCashier({ name: cashierName.trim(), pin: cashierPin.trim() });
    setCashierName('');
    setCashierPin('');
    setShowAddCashier(false);
  };

  const handleRemoveCashier = (cashier: Cashier) => {
    Alert.alert(
      'Eliminar Cajero',
      `¿Estás seguro de eliminar a ${cashier.name}?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            removeCashier(cashier.id);
            if (activeCashier?.id === cashier.id) setActiveCashier(null);
          },
        },
      ]
    );
  };

  const handleLeaveEvent = () => {
    Alert.alert(
      'Salir del Evento',
      '¿Estás seguro de que deseas salir? Se perderán los datos locales del evento.',
      [
        { text: 'Cancelar' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            leaveEvent();
            navigation.navigate('Onboarding');
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      'Resetear Todo',
      'Esta acción eliminará TODOS los datos de la app. ¿Confirmas?',
      [
        { text: 'Cancelar' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => {
            resetAll();
            navigation.navigate('Onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usuario</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{currentUser?.name ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.accent} />
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{userRole === 'organizer' ? 'Organizador' : 'Puesto'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={20} color={Colors.warning} />
            <Text style={styles.infoLabel}>Plan</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{plan === 'premium' ? 'PREMIUM' : 'GRATUITO'}</Text>
            </View>
          </View>
        </View>

        {/* Event */}
        {currentEvent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evento Activo</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{currentEvent.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={Colors.subtext} />
              <Text style={styles.infoLabel}>Ubicación</Text>
              <Text style={styles.infoValue}>{currentEvent.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={20} color={Colors.accent} />
              <Text style={styles.infoLabel}>Código</Text>
              <Text style={[styles.infoValue, { color: Colors.primary, fontWeight: '700' }]}>
                {currentEvent.accessCode}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={20} color={Colors.warning} />
              <Text style={styles.infoLabel}>Comisión</Text>
              <Text style={styles.infoValue}>{(currentEvent.commissionRate * 100).toFixed(0)}%</Text>
            </View>
          </View>
        )}

        {/* Stand */}
        {currentStand && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tu Puesto</Text>
            <View style={styles.infoRow}>
              <Ionicons name="storefront-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{currentStand.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color={Colors.subtext} />
              <Text style={styles.infoLabel}>Productos</Text>
              <Text style={styles.infoValue}>{currentStand.products.length}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="receipt-outline" size={20} color={Colors.subtext} />
              <Text style={styles.infoLabel}>Transacciones</Text>
              <Text style={styles.infoValue}>{currentStand.transactions.length}</Text>
            </View>
          </View>
        )}

        {/* Cashiers */}
        {currentStand && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cajeros</Text>
              <TouchableOpacity onPress={() => setShowAddCashier(true)}>
                <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.cashierCurrent}>
              <Ionicons name="person-outline" size={16} color={Colors.accent} />
              <Text style={styles.cashierCurrentText}>
                Cajero activo: {activeCashier?.name ?? 'Principal'}
              </Text>
            </View>

            {cashiers.map((c) => (
              <View key={c.id} style={styles.cashierRow}>
                <View style={styles.cashierInfo}>
                  <Text style={styles.cashierName}>{c.name}</Text>
                  {c.pin ? <Text style={styles.cashierPin}>PIN: {'•'.repeat(c.pin.length)}</Text> : null}
                </View>
                <View style={styles.cashierActions}>
                  <TouchableOpacity
                    style={[
                      styles.cashierSelectBtn,
                      activeCashier?.id === c.id && styles.cashierSelectBtnActive,
                    ]}
                    onPress={() => setActiveCashier(activeCashier?.id === c.id ? null : c)}
                  >
                    <Text style={styles.cashierSelectBtnText}>
                      {activeCashier?.id === c.id ? 'Activo' : 'Activar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveCashier(c)}>
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {cashiers.length === 0 && (
              <Text style={styles.noCashiers}>
                Sin cajeros adicionales. Toca + para agregar uno.
              </Text>
            )}
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de Peligro</Text>
          {currentEvent && (
            <TouchableOpacity style={styles.dangerButton} onPress={handleLeaveEvent}>
              <Ionicons name="exit-outline" size={18} color={Colors.danger} />
              <Text style={styles.dangerButtonText}>Salir del Evento</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dangerButton} onPress={handleResetAll}>
            <Ionicons name="nuclear-outline" size={18} color={Colors.danger} />
            <Text style={styles.dangerButtonText}>Resetear Todo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>PopUp Analytics v1.0.0 · Modo Offline</Text>
      </ScrollView>

      {/* Add Cashier Modal */}
      <Modal visible={showAddCashier} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Agregar Cajero</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del cajero"
              placeholderTextColor={Colors.subtext}
              value={cashierName}
              onChangeText={setCashierName}
            />
            <TextInput
              style={styles.input}
              placeholder="PIN (opcional)"
              placeholderTextColor={Colors.subtext}
              value={cashierPin}
              onChangeText={setCashierPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setShowAddCashier(false); setCashierName(''); setCashierPin(''); }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddCashier}>
                <Text style={styles.modalConfirmText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 16, gap: 4, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  infoLabel: { color: Colors.subtext, fontSize: 14, flex: 1 },
  infoValue: { color: Colors.text, fontSize: 14 },
  planBadge: {
    backgroundColor: Colors.warning + '33',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planBadgeText: { color: Colors.warning, fontSize: 11, fontWeight: '700' },
  cashierCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent + '11',
    borderRadius: 8,
    padding: 8,
  },
  cashierCurrentText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  cashierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cashierInfo: { flex: 1 },
  cashierName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  cashierPin: { color: Colors.subtext, fontSize: 12, marginTop: 2 },
  cashierActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cashierSelectBtn: {
    backgroundColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cashierSelectBtnActive: { backgroundColor: Colors.primary },
  cashierSelectBtnText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  noCashiers: { color: Colors.subtext, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.danger + '11',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '33',
  },
  dangerButtonText: { color: Colors.danger, fontSize: 14, fontWeight: '600' },
  version: { color: Colors.subtext, fontSize: 12, textAlign: 'center', marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: { color: Colors.subtext, fontWeight: '600' },
  modalConfirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: { color: Colors.text, fontWeight: '700' },
});
