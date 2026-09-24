import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/Button';
import { FilledIcon } from '@/components/Icon';
import { Divider } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import type { AppEvent } from '@/data/types';
import { success, tap } from '@/lib/actions';
import { formatDateTime } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, maxContentWidth, radius } from '@/theme';

import { priceValue } from './hours';

const MIN = 1;
const MAX = 6;

const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

/** Bottom sheet to buy tickets (or reserve a free spot) for an event. Remount (via `key`) to reset. */
export function TicketSheet({ event, visible, onClose }: { event: AppEvent; visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(MIN);
  const [slide] = useState(() => new Animated.Value(0));
  const unit = priceValue(event.price);
  const free = unit === 0;

  useEffect(() => {
    if (!visible) return;
    slide.setValue(0);
    Animated.timing(slide, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible, slide]);

  const change = (delta: number) => {
    const next = Math.min(MAX, Math.max(MIN, qty + delta));
    if (next !== qty) {
      tap();
      setQty(next);
    }
  };

  const confirm = () => {
    useAppStore.getState().buyTickets(event.id, qty);
    success();
    showToast(free ? '¡Cupo reservado! 🎟️' : '¡Entradas listas! 🎟️');
    onClose();
  };

  const noun = free ? (qty === 1 ? 'cupo' : 'cupos') : qty === 1 ? 'entrada' : 'entradas';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 20 },
            { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [420, 0] }) }] },
          ]}>
          <View style={styles.handle} />
          <View style={styles.headRow}>
            <View style={styles.headText}>
              <AppText variant="h3">{free ? 'Reservar cupo' : 'Comprar entradas'}</AppText>
              <AppText variant="small" numberOfLines={1}>
                {event.title}
              </AppText>
              <AppText variant="small" numberOfLines={1}>
                {formatDateTime(event.date)} · {event.venue}
              </AppText>
            </View>
            <IconButton icon="x" onPress={onClose} accessibilityLabel="Cerrar" background={colors.surfaceMuted} size={36} iconSize={18} />
          </View>

          <View style={styles.qtyRow}>
            <View style={styles.ticketIcon}>
              <FilledIcon name="ticket-outline" size={22} color={colors.blue} />
            </View>
            <View style={styles.headText}>
              <AppText variant="title">{free ? 'Cupos' : 'Entradas'}</AppText>
              <AppText variant="small">{free ? 'Entrada libre' : `${event.price} c/u`} · máx. {MAX}</AppText>
            </View>
            <View style={styles.stepper}>
              <IconButton
                icon="minus"
                onPress={() => change(-1)}
                size={36}
                iconSize={18}
                color={qty <= MIN ? colors.textFaint : colors.ink}
                background={colors.surfaceMuted}
                accessibilityLabel="Menos"
              />
              <AppText style={styles.qty} accessibilityLiveRegion="polite">
                {qty}
              </AppText>
              <IconButton
                icon="plus"
                onPress={() => change(1)}
                size={36}
                iconSize={18}
                color={qty >= MAX ? colors.textFaint : colors.white}
                background={qty >= MAX ? colors.surfaceMuted : colors.ink}
                accessibilityLabel="Más"
              />
            </View>
          </View>

          <Divider />

          <View style={styles.totalRow}>
            <AppText variant="body" color={colors.textMuted}>
              {qty} {noun}
              {free ? '' : ` × ${event.price}`}
            </AppText>
            <AppText style={styles.total}>{free ? 'Gratis' : money(unit * qty)}</AppText>
          </View>

          <Button
            label={free ? `Reservar ${qty} ${noun}` : `Pagar ${money(unit * qty)}`}
            variant="accent"
            iconRight="arrow-right"
            onPress={confirm}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  dismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
    gap: 18,
  },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headText: { flex: 1, gap: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticketIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qty: { minWidth: 30, textAlign: 'center', fontFamily: fonts.serifBold, fontSize: 22, color: colors.ink },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontFamily: fonts.serifBold, fontSize: 26, color: colors.ink },
});
