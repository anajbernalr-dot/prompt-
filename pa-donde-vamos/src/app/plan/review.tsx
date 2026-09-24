import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { MenuRow } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { Asterisk } from '@/components/illustrations';
import { draftHasTarget } from '@/components/plan/meta';
import { PlanSummaryCard } from '@/components/plan/PlanSummaryCard';
import { useDraftGuard } from '@/components/plan/useDraftGuard';
import { success, tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

export default function PlanReviewScreen() {
  useDraftGuard(draftHasTarget, '/plan/new');
  const draft = useAppStore((s) => s.draft);
  const setDraft = useAppStore((s) => s.setDraft);
  const commitDraft = useAppStore((s) => s.commitDraft);
  const [commentOpen, setCommentOpen] = useState(() => !!draft.comment);
  const [creating, setCreating] = useState(false);

  const create = () => {
    if (creating) return;
    setCreating(true);
    const id = commitDraft();
    if (!id) {
      router.replace('/plan/new');
      return;
    }
    success();
    router.replace(`/plan/ready?id=${id}`);
  };

  return (
    <Screen keyboard footer={<Button label="Crear plan" onPress={create} disabled={!draftHasTarget(draft) && !creating} />}>
      <Header title="Revisemos tu plan" fallback="/plan/friends" />

      {draftHasTarget(draft) ? (
        <PlanSummaryCard
          target={draft}
          date={draft.date}
          friendIds={draft.friendIds}
          onChangeDate={() => router.dismissTo('/plan/place')}
          onChangeFriends={() => router.dismissTo('/plan/friends')}
        />
      ) : null}

      <AppText variant="bodyLg" style={styles.question}>
        ¿Quieres agregar algo más?
      </AppText>

      <View style={styles.group}>
        <View style={styles.rowWrap}>
          <MenuRow
            icon="message-square"
            label={draft.comment?.trim() ? 'Editar comentario' : 'Agregar comentario'}
            onPress={() => {
              tap();
              setCommentOpen((o) => !o);
            }}
            right={
              <Icon name={commentOpen ? 'chevron-down' : 'chevron-right'} size={18} color={colors.textFaint} />
            }
            last={commentOpen}
          />
          {commentOpen ? (
            <View style={styles.commentBox}>
              <TextInput
                value={draft.comment ?? ''}
                onChangeText={(comment) => setDraft({ comment })}
                placeholder="Ej: Llego un poquito antes para agarrar mesa ☕️"
                placeholderTextColor={colors.placeholder}
                multiline
                maxLength={200}
                autoFocus={!draft.comment}
                accessibilityLabel="Comentario del plan"
                style={styles.comment}
              />
              <AppText variant="caption" align="right">
                {`${(draft.comment ?? '').length}/200`}
              </AppText>
            </View>
          ) : null}
        </View>
        <View style={[styles.rowWrap, commentOpen && styles.topDivider]}>
          <MenuRow
            icon="user-plus"
            label="Invitar a más amigos"
            onPress={() => router.dismissTo('/plan/friends')}
            last
          />
        </View>
      </View>

      <Asterisk width={26} style={styles.star} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: { marginTop: 28, marginBottom: 12, color: colors.inkSoft },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rowWrap: { paddingHorizontal: 18 },
  topDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderStrong },
  commentBox: { paddingBottom: 14, gap: 6 },
  comment: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
  star: { alignSelf: 'flex-end', marginTop: 22, marginRight: 14 },
});
