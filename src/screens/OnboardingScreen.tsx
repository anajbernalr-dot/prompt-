import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  navigation: any;
};

export default function OnboardingScreen({ navigation }: Props) {
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const setUserRole = useStore((s) => s.setUserRole);
  const currentUser = useStore((s) => s.currentUser);
  const [userName, setUserName] = useState(currentUser?.name ?? '');
  // Authenticated users already gave their name at registration — skip straight to role
  const [step, setStep] = useState<'name' | 'role'>(currentUser?.name ? 'role' : 'name');

  const handleContinue = () => {
    if (!userName.trim()) return;
    setCurrentUser({ id: uuidv4(), name: userName.trim() });
    setStep('role');
  };

  const handleOrganizer = () => {
    setUserRole('organizer');
    navigation.navigate('OrganizerSetup');
  };

  const handleStand = () => {
    navigation.navigate('StandJoin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <Text style={styles.logoIcon}>📊</Text>
          <Text style={styles.appName}>PopUp Analytics</Text>
          <Text style={styles.tagline}>Comercio transitorio. Datos reales.</Text>
        </View>

        {step === 'name' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>¿Cómo te llamas?</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre o alias"
              placeholderTextColor={Colors.subtext}
              value={userName}
              onChangeText={setUserName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <TouchableOpacity
              style={[styles.primaryButton, !userName.trim() && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!userName.trim()}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.rolesContainer}>
            <Text style={styles.rolesTitle}>¿Cuál es tu rol?</Text>
            <Text style={styles.rolesSubtitle}>Hola, {userName} 👋</Text>

            <TouchableOpacity style={styles.roleCard} onPress={handleOrganizer}>
              <View style={[styles.roleIcon, { backgroundColor: Colors.primary + '22' }]}>
                <Ionicons name="grid-outline" size={32} color={Colors.primary} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>Organizador</Text>
                <Text style={styles.roleDesc}>Crea el evento y gestiona todos los puestos desde una vista macro</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleCard} onPress={handleStand}>
              <View style={[styles.roleIcon, { backgroundColor: Colors.accent + '22' }]}>
                <Ionicons name="storefront-outline" size={32} color={Colors.accent} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>Puesto / Stand</Text>
                <Text style={styles.roleDesc}>Únete a un evento con código de acceso o usa el modo gratuito</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.subtext} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 56,
    marginBottom: 10,
  },
  appName: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: Colors.subtext,
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rolesContainer: {
    gap: 12,
  },
  rolesTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  rolesSubtitle: {
    color: Colors.subtext,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  roleCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  roleDesc: {
    color: Colors.subtext,
    fontSize: 12,
    lineHeight: 16,
  },
});
