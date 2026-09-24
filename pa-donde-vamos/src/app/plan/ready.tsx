import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Animated, BackHandler, Platform, StyleSheet, View } from 'react-native';

import { AvatarStack } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { Asterisk, CheersScene } from '@/components/illustrations';
import { describeTarget } from '@/components/plan/meta';
import { getFriend } from '@/data/friends';
import type { Friend } from '@/data/types';
import { formatDayLong, formatTime } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

const native = Platform.OS !== 'web';

/**
 * Leave the create-plan flow: pop it off the stack, then replace what is left with `href`
 * (works both from the tabs and when the flow was opened by a deep link).
 * `overHome` keeps Inicio underneath so "back" from `href` lands somewhere sensible.
 */
function exitFlow(href: string, overHome = false) {
  if (router.canDismiss()) router.dismissAll();
  if (overHome) {
    router.replace('/');
    router.push(href as never);
  } else {
    router.replace(href as never);
  }
}

export default function PlanReadyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const plan = useAppStore((s) => s.plans.find((p) => p.id === id));
  const [intro] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      if (!useAppStore.getState().plans.some((p) => p.id === id)) {
        router.replace('/');
        return;
      }
      // Android back from here would land on an emptied draft: go home instead.
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        exitFlow('/');
        return true;
      });
      return () => sub.remove();
    }, [id]),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(intro, { toValue: 1, friction: 6, tension: 50, useNativeDriver: native }),
      Animated.timing(rise, { toValue: 1, duration: 450, delay: 180, useNativeDriver: native }),
    ]).start();
  }, [intro, rise]);

  if (!plan) return <Screen>{null}</Screen>;

  const t = describeTarget(plan);
  const people = plan.friendIds.map((f) => getFriend(f)).filter((f): f is Friend => !!f);
  const focus = plan.placeId ?? plan.eventId;

  return (
    <Screen>
      <Animated.View
        style={[
          styles.art,
          {
            opacity: intro,
            transform: [
              { scale: intro.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              { rotate: intro.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] }) },
            ],
          },
        ]}>
        <CheersScene width={300} />
      </Animated.View>

      <Animated.View
        style={[
          styles.info,
          {
            opacity: rise,
            transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}>
        <Title align="center" style={styles.h1}>
          Tu plan está listo
        </Title>
        <AppText variant="title" align="center" style={styles.name} numberOfLines={2}>
          {t.name}
        </AppText>
        <AppText variant="bodyLg" align="center" color={colors.textMuted}>
          {`${formatDayLong(plan.date)} · ${formatTime(plan.date)}`}
        </AppText>
        {people.length ? (
          <AvatarStack people={people} size={48} max={3} style={styles.stack} />
        ) : (
          <AppText variant="small" align="center" style={styles.stack}>
            Vas por tu cuenta. ¡Disfrútalo!
          </AppText>
        )}
      </Animated.View>

      <View style={styles.actions}>
        {focus ? (
          <Button label="Ver en el mapa" onPress={() => exitFlow(`/map?focus=${focus}`)} />
        ) : (
          <Button label="Ver mi plan" onPress={() => exitFlow(`/plans/${plan.id}`, true)} />
        )}
        <Button label="Ir al inicio" variant="outline" onPress={() => exitFlow('/')} />
      </View>

      <View style={styles.doodle} pointerEvents="none">
        <Handwritten rotate={-12} size={23} style={styles.note}>
          {'Nos vemos\n   ahí'}
        </Handwritten>
        <Asterisk width={26} style={styles.star} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', marginTop: 28, marginBottom: 18 },
  info: { alignItems: 'center' },
  h1: { fontSize: 35, lineHeight: 42, marginBottom: 16 },
  name: { fontSize: 18.5, lineHeight: 24, marginBottom: 4 },
  stack: { marginTop: 20 },
  actions: { gap: 14, marginTop: 30 },
  doodle: { alignSelf: 'flex-end', width: 150, height: 86, marginTop: 14 },
  note: { position: 'absolute', right: 14, top: 0, lineHeight: 26 },
  star: { position: 'absolute', right: 2, bottom: 0 },
});
