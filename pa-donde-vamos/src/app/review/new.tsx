import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { goBack, Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Asterisk } from '@/components/illustrations';
import { targetInfo, type ReviewTarget } from '@/components/reviews/data';
import { StarInput } from '@/components/reviews/Stars';
import { TargetPicker } from '@/components/reviews/TargetPicker';
import { Screen } from '@/components/Screen';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { reactionMeta } from '@/data/reviews';
import type { Reaction } from '@/data/types';
import { success, tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

const REACTIONS: Reaction[] = ['love', 'meh', 'nope'];
const MAX = 400;

export default function NewReviewScreen() {
  const params = useLocalSearchParams<{ kind?: string; id?: string }>();
  const initial: ReviewTarget | null =
    (params.kind === 'place' || params.kind === 'event') && params.id ? { kind: params.kind, id: params.id } : null;
  const [target, setTarget] = useState<ReviewTarget | null>(initial && targetInfo(initial) ? initial : null);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const info = target ? targetInfo(target) : undefined;
  const canPublish = !!info && !!reaction && rating > 0;

  if (!target || !info) {
    return (
      <Screen keyboard>
        <Header title="Reseñar" fallback="/" />
        <Title style={styles.headline}>¿Qué vas a reseñar?</Title>
        <AppText style={styles.sub}>Elige el sitio o evento al que fuiste.</AppText>
        <View style={styles.pickerWrap}>
          <TargetPicker onPick={setTarget} />
        </View>
      </Screen>
    );
  }

  const publish = () => {
    if (!canPublish || !reaction) return;
    useAppStore.getState().addReview({ target, rating, reaction, text });
    success();
    showToast('¡Reseña publicada! 🙌', 'check');
    goBack(info.href);
  };

  return (
    <Screen
      keyboard
      footer={
        <Button
          label="Publicar"
          iconRight="send"
          disabled={!canPublish}
          onPress={publish}
          accessibilityLabel="Publicar reseña"
        />
      }>
      <Header fallback={info.href} />
      <View style={styles.titleRow}>
        <Title style={styles.headline}>¿Qué tal estuvo?</Title>
        <Asterisk width={24} style={styles.asterisk} />
      </View>

      <View style={styles.target}>
        <Photo source={info.image} rounded={16} style={styles.thumb} />
        <View style={styles.flex}>
          <AppText style={styles.targetName} numberOfLines={2}>
            {info.name}
          </AppText>
          <AppText style={styles.targetMeta} numberOfLines={1}>
            {info.meta}
          </AppText>
        </View>
        {!initial ? (
          <Pressable onPress={() => setTarget(null)} hitSlop={8} accessibilityRole="button" style={styles.change}>
            <AppText style={styles.changeText}>Cambiar</AppText>
          </Pressable>
        ) : null}
      </View>

      <AppText variant="label" style={styles.label}>
        Tu veredicto
      </AppText>
      <View style={styles.reactions}>
        {REACTIONS.map((r) => {
          const on = reaction === r;
          return (
            <Pressable
              key={r}
              onPress={() => {
                tap();
                setReaction(r);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={reactionMeta[r].label}
              style={({ pressed }) => [styles.reaction, on && styles.reactionOn, pressed && { transform: [{ scale: 0.97 }] }]}>
              <AppText style={styles.emoji}>{reactionMeta[r].emoji}</AppText>
              <AppText style={[styles.reactionLabel, on && { color: colors.white }]} numberOfLines={1}>
                {reactionMeta[r].label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        <AppText variant="label" style={styles.label}>
          Tu puntuación
        </AppText>
        <AppText style={styles.ratingValue}>{rating ? `${rating.toFixed(1)} / 5` : ''}</AppText>
      </View>
      <View style={styles.stars}>
        <StarInput value={rating} onChange={setRating} />
        <Handwritten rotate={-3} size={15} style={styles.hint}>
          toca otra vez para media estrella
        </Handwritten>
      </View>

      <AppText variant="label" style={styles.label}>
        Tu reseña
      </AppText>
      <View style={styles.inputBox}>
        <TextInput
          value={text}
          onChangeText={(t) => setText(t.slice(0, MAX))}
          placeholder="Cuéntale a tus panas…"
          placeholderTextColor={colors.placeholder}
          multiline
          textAlignVertical="top"
          style={styles.input}
          accessibilityLabel="Comentario"
        />
        <View style={styles.counter}>
          <Icon name="edit-3" size={13} color={colors.textFaint} />
          <AppText style={styles.counterText}>
            {text.length}/{MAX}
          </AppText>
        </View>
      </View>
      {!canPublish ? (
        <AppText style={styles.need}>Elige un veredicto y tus estrellas para publicar.</AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  asterisk: { marginTop: 18 },
  headline: { fontSize: 34, lineHeight: 39, marginTop: 10 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, marginTop: 6 },
  pickerWrap: { marginTop: 18 },
  target: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 10,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumb: { width: 64, height: 64 },
  targetName: { fontFamily: fonts.serifBold, fontSize: 18, lineHeight: 22, color: colors.ink },
  targetMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  change: { paddingHorizontal: 8, minHeight: 44, justifyContent: 'center' },
  changeText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.blue },
  label: { marginTop: 26, color: colors.inkSoft },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  ratingValue: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink },
  reactions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  reaction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 96,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  reactionOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  emoji: { fontSize: 30, lineHeight: 36 },
  reactionLabel: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.ink },
  stars: { marginTop: 8, alignItems: 'center' },
  hint: { marginTop: 4 },
  inputBox: {
    marginTop: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  input: { minHeight: 110, fontFamily: fonts.sans, fontSize: 16, lineHeight: 22, color: colors.ink, padding: 0 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end' },
  counterText: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  need: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 12, textAlign: 'center' },
});
