import { useMemo } from 'react';

import { seedAnswers, seedQuestions } from '@/data/questions';
import type { Answer, Question } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

/** Seed + the user's own questions, newest first. */
export function useAllQuestions(): Question[] {
  const mine = useAppStore((s) => s.myQuestions);
  return useMemo(() => [...mine, ...seedQuestions].sort((a, b) => b.at.localeCompare(a.at)), [mine]);
}

export function useQuestion(id?: string): Question | undefined {
  const mine = useAppStore((s) => s.myQuestions);
  return useMemo(() => mine.find((x) => x.id === id) ?? seedQuestions.find((x) => x.id === id), [mine, id]);
}

const EMPTY: Answer[] = [];

/** Seed answers + answers added in the store, oldest first. */
export function useAnswers(questionId?: string): Answer[] {
  const added = useAppStore((s) => (questionId ? s.answers[questionId] : undefined)) ?? EMPTY;
  return useMemo(
    () => [...seedAnswers.filter((a) => a.questionId === questionId), ...added].sort((a, b) => a.at.localeCompare(b.at)),
    [added, questionId],
  );
}
