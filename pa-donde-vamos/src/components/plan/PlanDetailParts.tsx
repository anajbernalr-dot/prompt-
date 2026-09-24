import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Icon, type IconName } from '@/components/Icon';
import { Card } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import type { Friend } from '@/data/types';
import { tap } from '@/lib/actions';
import { colors, fonts, radius } from '@/theme';

/** Icon + text line under the plan title; pressable when `onPress` is set. */
export function InfoLine({ icon, text, onPress }: { icon: IconName; text: string; onPress?: () => void }) {
  const body = (
    <>
      <Icon name={icon} size={17} color={colors.textMuted} />
      <AppText variant="body" color={colors.textMuted} style={styles.flex} numberOfLines={2}>
        {text}
      </AppText>
      {onPress ? <Icon name="chevron-right" size={17} color={colors.textFaint} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.info}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={text}
      onPress={onPress}
      style={({ pressed }) => [styles.info, pressed && { opacity: 0.6 }]}>
      {body}
    </Pressable>
  );
}

/** "Con" — friends in the plan, each opens the chat with them. */
export function PlanPeople({ people }: { people: Friend[] }) {
  if (!people.length) {
    return (
      <AppText variant="body" color={colors.textMuted}>
        Solo tú. A veces el mejor plan es con uno mismo.
      </AppText>
    );
  }
  return (
    <View style={styles.group}>
      {people.map((f, i) => (
        <Pressable
          key={f.id}
          accessibilityRole="button"
          accessibilityLabel={`Escribirle a ${f.name}`}
          onPress={() => router.push(`/chat/${f.id}`)}
          style={({ pressed }) => [
            styles.person,
            i < people.length - 1 && styles.divider,
            pressed && { backgroundColor: colors.surfaceMuted },
          ]}>
          <Avatar name={f.name} image={f.avatar} size={44} online={f.online} />
          <View style={styles.flex}>
            <AppText variant="title" numberOfLines={1}>
              {f.name}
            </AppText>
            <AppText variant="small" color={colors.textFaint} numberOfLines={1}>
              @{f.handle}
            </AppText>
          </View>
          <View style={styles.chatIcon}>
            <Icon name="message-circle" size={18} color={colors.blue} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/** The plan's note, styled as a quote. */
export function PlanComment({ text }: { text: string }) {
  return (
    <Card style={styles.quote}>
      <AppText style={styles.quoteMark}>“</AppText>
      <AppText variant="bodyLg" style={styles.flex}>
        {text}
      </AppText>
    </Card>
  );
}

/** Two-step destructive text button: first tap arms it, second tap confirms. */
export function CancelPlanButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={armed ? 'Confirmar: cancelar plan' : 'Cancelar plan'}
      onPress={() => {
        tap();
        if (armed) onConfirm();
        else setArmed(true);
      }}
      style={({ pressed }) => [styles.cancel, armed && styles.cancelArmed, pressed && { opacity: 0.6 }]}>
      <Icon name={armed ? 'alert-circle' : 'x-circle'} size={17} color={colors.danger} />
      <AppText variant="label" color={colors.danger} style={{ fontFamily: fonts.sansSemi }}>
        {armed ? '¿Seguro? Toca de nuevo para cancelar' : 'Cancelar plan'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  person: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  chatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: { flexDirection: 'row', gap: 10, paddingVertical: 14 },
  quoteMark: { fontFamily: fonts.serifBlack, fontSize: 44, lineHeight: 44, color: colors.blue, marginTop: -2 },
  cancel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.pill,
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  cancelArmed: { backgroundColor: 'rgba(196, 69, 43, 0.1)' },
});
