import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/Fields';
import { Header } from '@/components/Header';
import { DangerButton, SettingsSection, SwitchRow } from '@/components/profile/SettingsParts';
import { Screen } from '@/components/Screen';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { success } from '@/lib/actions';
import { useAppStore, type Settings } from '@/store/useAppStore';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const user = useAppStore((s) => s.user);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const logOut = useAppStore((s) => s.logOut);

  const [name, setName] = useState(user?.name ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [confirmReset, setConfirmReset] = useState(false);

  const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
  const nameError = name.trim().length < 2 ? 'Escribe tu nombre' : null;
  const handleError = cleanHandle.length < 3 ? 'Mínimo 3 caracteres' : null;
  const dirty = name.trim() !== (user?.name ?? '') || cleanHandle !== (user?.handle ?? '');

  const save = () => {
    if (nameError || handleError) return;
    updateProfile({ name: name.trim(), handle: cleanHandle });
    setHandle(cleanHandle);
    success();
    showToast('Perfil actualizado');
  };

  const toggle = (key: keyof Settings) => (v: boolean) => updateSettings({ [key]: v });

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetDemo();
    setConfirmReset(false);
    showToast('Datos de ejemplo restablecidos', 'refresh-cw');
  };

  return (
    <Screen keyboard>
      <Header title="Configuración" fallback="/profile" />

      <View style={{ height: 8 }} />

      <SettingsSection title="Tu cuenta">
        <View style={styles.account}>
          <TextField
            label="Nombre"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={name.length ? nameError : null}
          />
          <TextField
            label="Usuario"
            value={handle ? `@${handle.replace(/^@/, '')}` : ''}
            onChangeText={(t) => setHandle(t.replace(/^@/, ''))}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="@tuusuario"
            error={handle.length ? handleError : null}
          />
          <AppText variant="small" color={colors.textFaint}>
            {user?.email}
          </AppText>
          <Button
            label="Guardar cambios"
            size="sm"
            fullWidth={false}
            disabled={!dirty || !!nameError || !!handleError}
            onPress={save}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Notificaciones">
        <SwitchRow label="Planes e invitaciones" value={settings.notifyPlans} onChange={toggle('notifyPlans')} />
        <SwitchRow label="Actividad de tus panas" value={settings.notifyFriends} onChange={toggle('notifyFriends')} />
        <SwitchRow
          label="Eventos recomendados"
          value={settings.notifyEvents}
          onChange={toggle('notifyEvents')}
          last
        />
      </SettingsSection>

      <SettingsSection title="Privacidad">
        <SwitchRow
          label="Perfil privado"
          hint="Solo tus panas ven tus planes"
          value={settings.privateProfile}
          onChange={toggle('privateProfile')}
        />
        <SwitchRow
          label="Compartir mi ubicación"
          hint="Para ver lugares cerca de ti"
          value={settings.shareLocation}
          onChange={toggle('shareLocation')}
          last
        />
      </SettingsSection>

      <SettingsSection title="Datos de ejemplo">
        <View style={styles.account}>
          <AppText variant="small">
            {confirmReset
              ? 'Se reemplazarán tus guardados, planes y chats por los de ejemplo.'
              : 'Vuelve a los lugares, planes y chats de ejemplo.'}
          </AppText>
          <View style={styles.actions}>
            <Button
              label={confirmReset ? 'Sí, restablecer' : 'Restablecer datos de ejemplo'}
              variant={confirmReset ? 'primary' : 'outline'}
              size="sm"
              iconLeft="refresh-cw"
              fullWidth={false}
              onPress={reset}
            />
            {confirmReset ? (
              <Button label="Cancelar" variant="ghost" size="sm" fullWidth={false} onPress={() => setConfirmReset(false)} />
            ) : null}
          </View>
        </View>
      </SettingsSection>

      <DangerButton label="Cerrar sesión" icon="log-out" onPress={logOut} />
      <AppText variant="caption" align="center" style={styles.version}>
        Pa&apos; Donde Vamos Hoy? · v1.0
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: { gap: 14, paddingVertical: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  version: { marginTop: 18 },
});
