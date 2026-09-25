import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AnswerRow, PlaceMini } from '@/components/ask/AnswerRow';
import { useAnswers, useQuestion } from '@/components/ask/data';
import { QuestionCard } from '@/components/ask/QuestionCard';
import { Button, IconButton } from '@/components/Button';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { useAuthorResolver } from '@/components/reviews/data';
import { Screen } from '@/components/Screen';
import { EmptyState, Photo } from '@/components/Surfaces';
import { AppText, Title } from '@/components/Typography';
import { placeImage } from '@/data/images';
import { places } from '@/data/places';
import { tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = useQuestion(id);
  const answers = useAnswers(id);
  const resolve = useAuthorResolver();
  const [text, setText] = useState('');
  const [placeId, setPlaceId] = useState<string | undefined>();
  const [picking, setPicking] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const author = question ? resolve(question.authorId) : undefined;
  if (!question || !author) {
    return (
      <Screen>
        <Header fallback="/" />
        <EmptyState
          icon="message-square"
          title="No encontramos esta pregunta"
          body="Puede que la hayan borrado."
          action={<Button label="Volver al inicio" size="md" fullWidth={false} onPress={() => router.replace('/')} />}
        />
      </Screen>
    );
  }

  const last = answers[answers.length - 1];
  const typing = waiting && last?.authorId === 'me';
  const canSend = text.trim().length > 0 || !!placeId;

  const send = () => {
    if (!canSend) return;
    tap();
    useAppStore.getState().addAnswer(question.id, { text, placeId });
    setText('');
    setPlaceId(undefined);
    setWaiting(true);
  };

  const footer = (
    <View style={styles.footer}>
      {placeId ? <PlaceMini placeId={placeId} onRemove={() => setPlaceId(undefined)} /> : null}
      <Pressable onPress={() => setPicking(true)} accessibilityRole="button" style={styles.chip}>
        <Icon name="map-pin" size={14} color={colors.blue} />
        <AppText style={styles.chipText}>{placeId ? 'Cambiar lugar' : 'Recomendar un lugar'}</AppText>
      </Pressable>
      <View style={styles.inputRow}>
        <View style={styles.pill}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un comentario…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="send"
            submitBehavior="submit"
            onSubmitEditing={send}
            accessibilityLabel="Escribe un comentario"
            style={styles.input}
          />
        </View>
        <IconButton
          icon="send"
          iconSize={19}
          size={48}
          color={colors.white}
          background={canSend ? colors.blue : colors.blueSoft}
          accessibilityLabel="Enviar respuesta"
          onPress={send}
        />
      </View>
    </View>
  );

  return (
    <Screen scroll={false} keyboard footer={footer}>
      <Header fallback="/" />
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => waiting && scrollRef.current?.scrollToEnd({ animated: true })}>
        <QuestionCard question={question} author={author} detail />
        <Title level={3} style={styles.h2}>
          Respuestas
        </Title>
        {answers.length === 0 && !typing ? (
          <AppText style={styles.empty}>Todavía nadie responde. ¡Sé el primero en recomendar algo!</AppText>
        ) : null}
        {answers.map((a) => {
          const who = resolve(a.authorId);
          if (!who) return null;
          return (
            <AnswerRow
              key={a.id}
              answer={a}
              author={who}
              onReply={(name) => {
                setText((t) => (t ? t : `@${name.split(' ')[0]} `));
                inputRef.current?.focus();
              }}
            />
          );
        })}
        {typing ? <AppText style={styles.typing}>Un pana está escribiendo…</AppText> : null}
      </ScrollView>

      <Modal visible={picking} transparent animationType="slide" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(false)} accessibilityLabel="Cerrar" />
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Title level={3}>Recomendar un lugar</Title>
            <IconButton icon="x" iconSize={22} accessibilityLabel="Cerrar" onPress={() => setPicking(false)} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {places.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  tap();
                  setPlaceId(p.id);
                  setPicking(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={p.name}
                style={({ pressed }) => [styles.pickRow, pressed && { opacity: 0.7 }]}>
                <Photo source={placeImage(p.image)} rounded={10} style={styles.pickThumb} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.pickName}>{p.name}</AppText>
                  <AppText style={styles.pickMeta}>
                    {p.categoryLabel} · {p.zone} · ★ {p.rating.toFixed(1)}
                  </AppText>
                </View>
                {placeId === p.id ? <Icon name="check" size={18} color={colors.blue} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, marginHorizontal: -22 },
  listContent: { paddingHorizontal: 22, paddingBottom: 16 },
  h2: { marginTop: 6, marginBottom: 6 },
  empty: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textMuted, paddingVertical: 16 },
  typing: { fontFamily: fonts.sans, fontStyle: 'italic', fontSize: 13.5, color: colors.textMuted, paddingVertical: 12 },
  footer: { gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.blue,
  },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.blue },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: {
    flex: 1,
    height: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { height: '100%', fontFamily: fonts.sans, fontSize: 15, color: colors.text, outlineStyle: 'none' } as object,
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  pickThumb: { width: 48, height: 48 },
  pickName: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  pickMeta: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
});
