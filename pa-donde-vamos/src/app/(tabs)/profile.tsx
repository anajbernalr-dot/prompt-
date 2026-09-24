import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { Asterisk } from '@/components/illustrations';
import { Preferences } from '@/components/profile/Preferences';
import { StatsRow } from '@/components/profile/StatsRow';
import { Screen } from '@/components/Screen';
import { showToast } from '@/components/Toast';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { shareText } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

function Row({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Icon name={icon} size={21} color={colors.ink} />
      <AppText style={styles.rowLabel}>{label}</AppText>
      <Icon name="chevron-right" size={19} color={colors.textFaint} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const savedCount = useAppStore((s) => s.savedPlaces.length + s.savedEvents.length);
  const friendCount = useAppStore((s) => s.friendIds.length);
  const planCount = useAppStore((s) => s.plans.length);
  const logOut = useAppStore((s) => s.logOut);

  const invite = async () => {
    const ok = await shareText("¡Vente a Pa' Donde Vamos Hoy? Descubre planes en Caracas con tus panas 🙌");
    if (ok) showToast('Invitación lista para compartir', 'share-2');
  };

  const name = user?.name ?? 'Pana';

  return (
    <Screen safeBottom={false}>
      <View style={styles.top}>
        <IconButton
          icon="settings"
          iconSize={24}
          color={colors.ink}
          size={44}
          accessibilityLabel="Configuración"
          onPress={() => router.push('/settings')}
        />
      </View>

      <View style={styles.identity}>
        <Avatar name={name} image={user?.avatar} size={96} />
        <View style={styles.names}>
          <Title level={2} numberOfLines={2}>
            {name}
          </Title>
          <AppText variant="body" color={colors.textFaint}>
            @{user?.handle ?? 'pana'}
          </AppText>
        </View>
        <Asterisk width={22} style={styles.asterisk} />
      </View>

      <StatsRow
        stats={[
          { key: 'saved', value: savedCount, label: 'Guardados', onPress: () => router.navigate('/saved') },
          { key: 'panas', value: friendCount, label: 'Panas', onPress: () => router.navigate('/friends') },
          { key: 'plans', value: planCount, label: 'Planes', onPress: () => router.navigate('/saved?tab=planes') },
        ]}
      />

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <AppText style={styles.sectionTitle}>Mis preferencias</AppText>
          <Handwritten size={17} rotate={-5} style={styles.note}>
            Lo tuyo
          </Handwritten>
        </View>
        <Preferences />
      </View>

      <View style={styles.hr} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/settings')}
        style={({ pressed }) => [styles.configHead, pressed && { opacity: 0.6 }]}>
        <AppText style={styles.sectionTitle}>Configuración</AppText>
        <Icon name="chevron-right" size={19} color={colors.textFaint} />
      </Pressable>
      <Row icon="bell" label="Notificaciones" onPress={() => router.push('/settings')} />
      <Row icon="lock" label="Privacidad" onPress={() => router.push('/settings')} />
      <Row icon="users" label="Mis amigos" onPress={() => router.navigate('/friends')} />
      <Row icon="share-2" label="Invitar panas" onPress={invite} />

      <Button
        label="Cerrar sesión"
        variant="ghost"
        size="md"
        iconLeft="log-out"
        fullWidth={false}
        onPress={logOut}
        style={styles.logout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', marginRight: -8, marginBottom: -18 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 22, marginBottom: 20 },
  names: { flex: 1, gap: 2 },
  asterisk: { position: 'absolute', left: 90, top: -2 },
  section: { marginTop: 22, marginBottom: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontFamily: fonts.sansMedium, fontSize: 19, lineHeight: 24, color: colors.text },
  note: { marginRight: 4 },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginBottom: 6 },
  configHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 50 },
  rowLabel: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 16.5, color: colors.text },
  logout: { marginTop: 18, marginLeft: -12 },
});
