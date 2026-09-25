import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { FilledIcon, Icon } from '@/components/Icon';
import { HandDoodle } from '@/components/illustrations';
import type { ReviewAuthor } from '@/components/reviews/data';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import type { Question } from '@/data/types';
import { shareText, tap } from '@/lib/actions';
import { formatTimeAgo } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

import { useAnswers } from './data';

const HEART = '#FF5A5F';

export function QuestionCard({ question, author, detail = false }: { question: Question; author: ReviewAuthor; detail?: boolean }) {
  const liked = useAppStore((s) => s.likedQuestions.includes(question.id));
  const answers = useAnswers(question.id);
  const [menu, setMenu] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const likes = question.likes + (liked ? 1 : 0);
  const open = detail ? undefined : () => router.push(`/ask/${question.id}`);

  const like = () => {
    tap();
    useAppStore.getState().toggleLikeQuestion(question.id);
  };
  const share = async () => {
    const ok = await shareText(`${author.isMe ? 'Pregunto' : `${author.name} pregunta`}: "${question.title}" 📍 ${question.location}`);
    if (ok && Platform.OS === 'web') showToast('Enlace copiado', 'link');
  };
  const bookmark = () => {
    tap();
    setBookmarked((b) => !b);
    showToast(bookmarked ? 'Quitado de guardados' : 'Guardado', 'bookmark');
  };
  const remove = () => {
    setMenu(false);
    useAppStore.getState().deleteQuestion(question.id);
    showToast('Recomendación borrada', 'trash-2');
    if (detail) router.back();
  };

  return (
    <View style={[styles.card, detail && styles.cardDetail]}>
      <View style={styles.authorRow}>
        <Avatar name={author.name} image={author.avatar} size={42} />
        <View style={styles.flex}>
          <AppText style={styles.name} numberOfLines={1}>
            {author.isMe ? `${author.name} (tú)` : author.name}
          </AppText>
          <AppText style={styles.handle} numberOfLines={1}>
            @{author.handle} · {formatTimeAgo(question.at)}
          </AppText>
        </View>
        <Pressable
          onPress={() => (author.isMe ? setMenu((m) => !m) : showToast('Gracias, lo tendremos en cuenta', 'flag'))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Más opciones"
          style={styles.iconBtn}>
          <Icon name="more-horizontal" size={20} color={colors.textMuted} />
        </Pressable>
        {menu ? (
          <Pressable onPress={remove} accessibilityRole="button" style={styles.menu}>
            <Icon name="trash-2" size={16} color={colors.danger} />
            <AppText style={styles.menuText}>Borrar</AppText>
          </Pressable>
        ) : null}
      </View>

      <Pressable onPress={open} disabled={!open} accessibilityRole={open ? 'button' : undefined} accessibilityLabel={question.title}>
        {({ pressed }) => (
          <View style={[styles.inner, pressed && { opacity: 0.85 }]}>
            <View style={styles.titleRow}>
              <HandDoodle width={40} style={styles.hand} />
              <View style={styles.flex}>
                <AppText style={styles.title}>{question.title}</AppText>
                <View style={styles.locRow}>
                  <Icon name="map-pin" size={13} color={colors.textMuted} />
                  <AppText style={styles.loc}>{question.location}</AppText>
                </View>
              </View>
            </View>
            {question.body ? <AppText style={styles.body}>{question.body}</AppText> : null}
          </View>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Pressable onPress={open} disabled={!open} hitSlop={6} style={styles.count}>
          <Icon name="message-square" size={14} color={colors.textMuted} />
          <AppText style={styles.countText}>
            {answers.length} {answers.length === 1 ? 'respuesta' : 'respuestas'}
          </AppText>
        </Pressable>
        <View style={styles.flex} />
        <Pressable onPress={like} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: liked }} accessibilityLabel={liked ? 'Quitar me gusta' : 'Me gusta'} style={styles.action}>
          <FilledIcon name={liked ? 'heart' : 'heart-outline'} size={21} color={liked ? HEART : colors.ink} />
          {likes ? <AppText style={styles.actionText}>{likes}</AppText> : null}
        </Pressable>
        <Pressable onPress={open ?? (() => {})} hitSlop={8} accessibilityRole="button" accessibilityLabel="Responder" style={styles.action}>
          <Icon name="message-circle" size={19} color={colors.ink} />
        </Pressable>
        <Pressable onPress={share} hitSlop={8} accessibilityRole="button" accessibilityLabel="Compartir" style={styles.action}>
          <Icon name="send" size={18} color={colors.ink} />
        </Pressable>
        <Pressable onPress={bookmark} hitSlop={8} accessibilityRole="button" accessibilityLabel="Guardar" style={styles.action}>
          <FilledIcon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={19} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { paddingVertical: 18, zIndex: 2 },
  cardDetail: { paddingTop: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 11, zIndex: 3 },
  name: { fontFamily: fonts.sansSemi, fontSize: 15.5, color: colors.ink },
  handle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  menu: {
    position: 'absolute',
    right: 0,
    top: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  menuText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.danger },
  inner: {
    marginTop: 14,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: '#E6E9F2',
    borderWidth: 1,
    borderColor: '#DCE1EE',
  },
  titleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  hand: { marginTop: 2 },
  title: { fontFamily: fonts.serifBold, fontSize: 19, lineHeight: 24, color: colors.ink },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  loc: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.textMuted },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21.5, color: colors.inkSoft, marginTop: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 },
  countText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.textMuted },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 36, minWidth: 28, justifyContent: 'center' },
  actionText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
});
