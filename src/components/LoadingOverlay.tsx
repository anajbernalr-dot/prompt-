import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Modal } from 'react-native';
import { Colors } from '../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 120,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  message: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 200,
  },
});
