import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Bubble, DaySeparator, TypingBubble } from '@/components/chat/Bubble';
import { ChatHeader, type MenuItem } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { Header } from '@/components/Header';
import { GlassesDoodle } from '@/components/illustrations';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Handwritten } from '@/components/Typography';
import { getFriend } from '@/data/friends';
import type { ChatMessage } from '@/data/types';
import { formatDayShort } from '@/lib/format';
import { tap } from '@/lib/actions';
import { planWithFriend, useAppStore } from '@/store/useAppStore';

const EMPTY: ChatMessage[] = [];

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.round((b - a) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return formatDayShort(d);
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const friend = getFriend(id);
  const messages = useAppStore((s) => (id ? s.chats[id] : undefined)) ?? EMPTY;
  const plans = useAppStore((s) => s.plans);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const spansDays = useMemo(() => new Set(messages.map((m) => dayKey(m.at))).size > 1, [messages]);
  const shared = useMemo(() => (friend ? planWithFriend(plans, friend.id) : undefined), [plans, friend]);

  if (!friend) {
    return (
      <Screen>
        <Header fallback="/friends" />
        <EmptyState
          icon="message-circle"
          title="No encontramos este chat"
          body="Puede que este pana ya no esté en la app."
          action={<Button label="Ver mis amigos" size="md" fullWidth={false} onPress={() => router.replace('/friends')} />}
        />
      </Screen>
    );
  }

  const last = messages[messages.length - 1];
  const typing = awaitingReply && last?.from === 'me';
  const short = messages.length <= 5;

  const menu: MenuItem[] = [
    {
      key: 'plan',
      label: 'Ver plan en común',
      icon: 'calendar',
      onPress: () => {
        setMenuOpen(false);
        if (shared) router.push(`/plans/${shared.id}`);
        else showToast(`Aún no tienes planes con ${friend.name}`, 'calendar');
      },
    },
    {
      key: 'mute',
      label: 'Silenciar chat',
      icon: 'bell-off',
      onPress: () => {
        setMenuOpen(false);
        showToast('Chat silenciado', 'bell-off');
      },
    },
  ];

  const onSend = (text: string) => {
    tap();
    setMenuOpen(false);
    sendMessage(friend.id, text);
    setAwaitingReply(true);
  };

  return (
    <Screen scroll={false} keyboard footer={<ChatInput onSend={onSend} />}>
      <ChatHeader
        friend={friend}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        items={menu}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => {
          const newDay = spansDays && (i === 0 || dayKey(messages[i - 1].at) !== dayKey(m.at));
          return (
            <Fragment key={m.id}>
              {newDay ? <DaySeparator label={dayLabel(m.at)} /> : null}
              <Bubble message={m} />
            </Fragment>
          );
        })}
        {typing ? <TypingBubble name={friend.name} /> : null}
        {short ? (
          <View style={styles.decoration} pointerEvents="none">
            <GlassesDoodle width={120} />
            <Handwritten size={30} rotate={-14} style={styles.note}>
              Nos vemos
            </Handwritten>
          </View>
        ) : null}
      </ScrollView>
      {menuOpen ? (
        <Pressable
          style={styles.backdrop}
          accessibilityLabel="Cerrar menú"
          onPress={() => setMenuOpen(false)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, marginHorizontal: -22 },
  listContent: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 12 },
  decoration: { flex: 1, minHeight: 190, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 28 },
  note: { marginTop: -8, marginRight: -6 },
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
});
