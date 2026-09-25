import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText, Title } from '@/components/Typography';
import type { AppNotification } from '@/data/types';
import { tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

const routeFor: Record<NonNullable<AppNotification['target']>['kind'], string> = {
  place: '/place/',
  event: '/event/',
  plan: '/plans/',
  friend: '/chat/',
  question: '/ask/',
};

export default function NotificationsScreen() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);

  const { fresh, older } = useMemo(() => {
    return { fresh: notifications.filter((n) => !n.read), older: notifications.filter((n) => n.read) };
  }, [notifications]);

  const open = (n: AppNotification) => {
    tap();
    if (!n.read) markRead(n.id);
    if (n.target) router.push(`${routeFor[n.target.kind]}${n.target.id}` as never);
  };

  const readAll = () => {
    markAll();
    showToast('Todo al día');
  };

  const section = (label: string, list: AppNotification[]) =>
    list.length ? (
      <View style={styles.section}>
        <AppText variant="small" style={styles.sectionLabel}>
          {label}
        </AppText>
        {list.map((n) => (
          <NotificationCard key={n.id} n={n} onPress={() => open(n)} />
        ))}
      </View>
    ) : null;

  return (
    <Screen>
      <Header
        fallback="/"
        right={
          fresh.length ? (
            <Pressable accessibilityRole="button" onPress={readAll} hitSlop={8} style={styles.link}>
              <AppText variant="small" style={styles.linkText}>
                Marcar todo como leído
              </AppText>
            </Pressable>
          ) : null
        }
      />
      <Title style={styles.title}>Notificaciones</Title>
      {notifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Nada nuevo por ahora"
          body="Aquí verás invitaciones, comentarios y recordatorios de tus planes."
          action={
            <Button label="Explorar planes" size="md" fullWidth={false} onPress={() => router.navigate('/explore')} />
          }
        />
      ) : (
        <>
          {section('Nuevas', fresh)}
          {section('Anteriores', older)}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 18 },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { color: colors.blue, fontFamily: fonts.sansSemi },
  section: { gap: 10, marginBottom: 22 },
  sectionLabel: {
    fontFamily: fonts.sansSemi,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
    color: colors.textMuted,
  },
});
