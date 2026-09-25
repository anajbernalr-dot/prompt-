import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getEvent } from '@/data/events';
import { getFriend } from '@/data/friends';
import { getPlace } from '@/data/places';
import { getSeedQuestion, questionAutoReplies, seedAnswers } from '@/data/questions';
import {
  autoReplies,
  defaultPreferences,
  defaultSavedEvents,
  defaultSavedPlaces,
  seedChats,
  seedNotifications,
  seedPlans,
} from '@/data/seed';
import type { Answer, AppNotification, ChatMessage, Question, Plan, PlanDraft, Reaction, Review, User } from '@/data/types';
import { makeHandle, uid } from '@/lib/format';

export type Settings = {
  notifyPlans: boolean;
  notifyFriends: boolean;
  notifyEvents: boolean;
  privateProfile: boolean;
  shareLocation: boolean;
};

export type Ticket = { id: string; eventId: string; qty: number; at: string };

type Data = {
  user: User | null;
  /** Finished the "Conecta con tus panas" step. */
  onboarded: boolean;
  contactsConnected: boolean;
  /** Connected friend ids (see data/friends). */
  friendIds: string[];
  savedPlaces: string[];
  savedEvents: string[];
  plans: Plan[];
  chats: Record<string, ChatMessage[]>;
  notifications: AppNotification[];
  preferences: string[];
  tickets: Ticket[];
  settings: Settings;
  /** Plan being built in the "Crear plan" flow. */
  draft: PlanDraft;
  /** Reviews written by the user (shown in the feed together with data/reviews seedReviews). */
  myReviews: Review[];
  /** Review ids the user liked. */
  likedReviews: string[];
  /** Questions ("Pide recomendaciones") posted by the user. */
  myQuestions: Question[];
  /** Answers added in this session (user + friend auto-replies), by question id. Seed answers live in data/questions. */
  answers: Record<string, Answer[]>;
  likedQuestions: string[];
};

type Actions = {
  signUp: (input: { name: string; email: string }) => void;
  /** Google / Apple buttons — creates the demo account. */
  signInWithProvider: (provider: 'google' | 'apple') => void;
  logIn: (email: string) => void;
  logOut: () => void;
  updateProfile: (patch: Partial<User>) => void;

  completeOnboarding: (connectContacts: boolean) => void;
  connectContacts: () => number;
  addFriend: (id: string) => void;

  toggleSavePlace: (id: string) => void;
  toggleSaveEvent: (id: string) => void;

  sendMessage: (friendId: string, text: string) => void;
  /** Simulates the friend answering after a short delay. */
  scheduleAutoReply: (friendId: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  togglePreference: (pref: string) => void;
  buyTickets: (eventId: string, qty: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;

  setDraft: (patch: Partial<PlanDraft>) => void;
  resetDraft: (patch?: Partial<PlanDraft>) => void;
  /** Turns the draft into a real plan and returns its id. */
  commitDraft: () => string | null;
  deletePlan: (id: string) => void;

  addReview: (input: { target: Review['target']; rating: number; reaction: Reaction; text: string }) => string;
  deleteReview: (id: string) => void;
  toggleLikeReview: (id: string) => void;

  addQuestion: (input: { title: string; location: string; body: string }) => string;
  deleteQuestion: (id: string) => void;
  addAnswer: (questionId: string, input: { text: string; placeId?: string }) => void;
  toggleLikeQuestion: (id: string) => void;

  resetDemo: () => void;
};

export type AppState = Data & Actions & { hydrated: boolean };

const emptyDraft: PlanDraft = { friendIds: [] };

const initialData: Data = {
  user: null,
  onboarded: false,
  contactsConnected: false,
  friendIds: [],
  savedPlaces: [],
  savedEvents: [],
  plans: [],
  chats: {},
  notifications: [],
  preferences: [],
  tickets: [],
  settings: {
    notifyPlans: true,
    notifyFriends: true,
    notifyEvents: true,
    privateProfile: false,
    shareLocation: true,
  },
  draft: emptyDraft,
  myReviews: [],
  likedReviews: [],
  myQuestions: [],
  answers: {},
  likedQuestions: [],
};

/** Sample content every new account starts with, so the app feels alive. */
function starterContent(): Partial<Data> {
  const now = new Date();
  return {
    friendIds: ['anasofi', 'luisv', 'sofir', 'valeria', 'carlam'],
    savedPlaces: [...defaultSavedPlaces],
    savedEvents: [...defaultSavedEvents],
    plans: seedPlans(now),
    chats: seedChats(now),
    notifications: seedNotifications(now),
    preferences: [...defaultPreferences],
    tickets: [],
    draft: emptyDraft,
  };
}

const replyTimers: Record<string, ReturnType<typeof setTimeout>> = {};
let answerReplyCount = 0;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,
      hydrated: false,

      signUp: ({ name, email }) =>
        set({
          ...starterContent(),
          user: { name: name.trim(), email: email.trim().toLowerCase(), handle: makeHandle(name), avatar: null },
          onboarded: false,
          contactsConnected: false,
        }),

      signInWithProvider: (provider) =>
        set({
          ...starterContent(),
          user: {
            name: 'Ana Julia',
            email: provider === 'google' ? 'ana.julia@gmail.com' : 'anajulia@icloud.com',
            handle: 'anajulia',
            avatar: 'anajulia',
          },
          onboarded: false,
          contactsConnected: false,
        }),

      logIn: (email) => {
        const current = get().user;
        // Same device, same account: just resume it.
        if (current && current.email === email.trim().toLowerCase()) return;
        const local = email.split('@')[0] ?? 'pana';
        const name = local
          .split(/[._-]+/)
          .filter(Boolean)
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(' ');
        set({
          ...starterContent(),
          user: { name: name || 'Pana', email: email.trim().toLowerCase(), handle: makeHandle(local), avatar: null },
          onboarded: true,
        });
      },

      logOut: () => {
        Object.values(replyTimers).forEach(clearTimeout);
        set({ ...initialData });
      },

      updateProfile: (patch) => {
        const user = get().user;
        if (user) set({ user: { ...user, ...patch } });
      },

      completeOnboarding: (connect) => {
        if (connect) get().connectContacts();
        set({ onboarded: true });
      },

      connectContacts: () => {
        const { friendIds, notifications } = get();
        const extra = ['diegop', 'gabo', 'mariaf'].filter((id) => !friendIds.includes(id));
        if (extra.length === 0) {
          set({ contactsConnected: true });
          return 0;
        }
        const note: AppNotification = {
          id: uid(),
          kind: 'follow',
          friendId: extra[0],
          text: `${extra.length} panas de tus contactos ya están en la app`,
          boldParts: [`${extra.length} panas`],
          target: { kind: 'friend', id: extra[0] },
          at: new Date().toISOString(),
          read: false,
        };
        set({ friendIds: [...friendIds, ...extra], contactsConnected: true, notifications: [note, ...notifications] });
        return extra.length;
      },

      addFriend: (id) => {
        const { friendIds } = get();
        if (!friendIds.includes(id)) set({ friendIds: [...friendIds, id] });
      },

      toggleSavePlace: (id) => {
        const { savedPlaces } = get();
        set({ savedPlaces: savedPlaces.includes(id) ? savedPlaces.filter((p) => p !== id) : [id, ...savedPlaces] });
      },

      toggleSaveEvent: (id) => {
        const { savedEvents } = get();
        set({ savedEvents: savedEvents.includes(id) ? savedEvents.filter((e) => e !== id) : [id, ...savedEvents] });
      },

      sendMessage: (friendId, text) => {
        const clean = text.trim();
        if (!clean) return;
        const { chats } = get();
        const msg: ChatMessage = { id: uid(), from: 'me', text: clean, at: new Date().toISOString() };
        set({ chats: { ...chats, [friendId]: [...(chats[friendId] ?? []), msg] } });
        get().scheduleAutoReply(friendId);
      },

      scheduleAutoReply: (friendId) => {
        clearTimeout(replyTimers[friendId]);
        replyTimers[friendId] = setTimeout(() => {
          const { chats } = get();
          const thread = chats[friendId] ?? [];
          const text = autoReplies[thread.length % autoReplies.length];
          const msg: ChatMessage = { id: uid(), from: friendId, text, at: new Date().toISOString() };
          set({ chats: { ...chats, [friendId]: [...thread, msg] } });
        }, 1600);
      },

      markNotificationRead: (id) =>
        set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }),

      markAllNotificationsRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      togglePreference: (pref) => {
        const { preferences } = get();
        set({ preferences: preferences.includes(pref) ? preferences.filter((p) => p !== pref) : [...preferences, pref] });
      },

      buyTickets: (eventId, qty) => {
        const event = getEvent(eventId);
        if (!event) return;
        const { tickets, notifications, savedEvents } = get();
        const note: AppNotification = {
          id: uid(),
          kind: 'tickets',
          text: `Compraste ${qty} ${qty === 1 ? 'entrada' : 'entradas'} para ${event.title}`,
          boldParts: [event.title],
          target: { kind: 'event', id: eventId },
          at: new Date().toISOString(),
          read: false,
        };
        set({
          tickets: [{ id: uid(), eventId, qty, at: new Date().toISOString() }, ...tickets],
          notifications: [note, ...notifications],
          savedEvents: savedEvents.includes(eventId) ? savedEvents : [eventId, ...savedEvents],
        });
      },

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      setDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),

      resetDraft: (patch) => set({ draft: { ...emptyDraft, ...patch } }),

      commitDraft: () => {
        const { draft, plans, notifications } = get();
        if (!draft.placeId && !draft.eventId && !draft.title) return null;
        const event = getEvent(draft.eventId);
        const date = draft.date ?? event?.date ?? new Date(Date.now() + 86_400_000).toISOString();
        const plan: Plan = {
          id: uid(),
          placeId: draft.placeId,
          eventId: draft.eventId,
          title: draft.title,
          date,
          friendIds: draft.friendIds,
          comment: draft.comment?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        const name = getPlace(plan.placeId)?.name ?? event?.title ?? plan.title ?? 'tu plan';
        const invited = plan.friendIds.map((id) => getFriend(id)?.name).filter(Boolean) as string[];
        const note: AppNotification = {
          id: uid(),
          kind: 'plan',
          text: invited.length
            ? `Invitaste a ${invited.join(', ')} a ${name}`
            : `Creaste un plan en ${name}`,
          boldParts: [name],
          target: { kind: 'plan', id: plan.id },
          at: new Date().toISOString(),
          read: true,
        };
        set({ plans: [plan, ...plans], notifications: [note, ...notifications], draft: emptyDraft });
        return plan.id;
      },

      deletePlan: (id) => set({ plans: get().plans.filter((p) => p.id !== id) }),

      addReview: ({ target, rating, reaction, text }) => {
        const review: Review = {
          id: uid(),
          authorId: 'me',
          target,
          rating,
          reaction,
          text: text.trim(),
          at: new Date().toISOString(),
          likes: 0,
        };
        set({ myReviews: [review, ...get().myReviews] });
        return review.id;
      },

      deleteReview: (id) => set({ myReviews: get().myReviews.filter((r) => r.id !== id) }),

      toggleLikeReview: (id) => {
        const { likedReviews } = get();
        set({ likedReviews: likedReviews.includes(id) ? likedReviews.filter((x) => x !== id) : [...likedReviews, id] });
      },

      addQuestion: ({ title, location, body }) => {
        const question: Question = {
          id: uid(),
          authorId: 'me',
          title: title.trim(),
          location: location.trim() || 'Caracas',
          body: body.trim(),
          at: new Date().toISOString(),
          likes: 0,
        };
        set({ myQuestions: [question, ...get().myQuestions] });
        scheduleAnswerReply(question.id, 2500);
        scheduleAnswerReply(question.id, 6000);
        return question.id;
      },

      deleteQuestion: (id) => {
        const { myQuestions, answers, notifications } = get();
        const rest = { ...answers };
        delete rest[id];
        set({
          myQuestions: myQuestions.filter((x) => x.id !== id),
          answers: rest,
          notifications: notifications.filter((n) => !(n.target?.kind === 'question' && n.target.id === id)),
        });
      },

      addAnswer: (questionId, { text, placeId }) => {
        const clean = text.trim();
        if (!clean && !placeId) return;
        const answer: Answer = {
          id: uid(),
          questionId,
          authorId: 'me',
          text: clean,
          placeId,
          at: new Date().toISOString(),
          likes: 0,
        };
        const { answers } = get();
        set({ answers: { ...answers, [questionId]: [...(answers[questionId] ?? []), answer] } });
        scheduleAnswerReply(questionId, 1800);
      },

      toggleLikeQuestion: (id) => {
        const { likedQuestions } = get();
        set({ likedQuestions: likedQuestions.includes(id) ? likedQuestions.filter((x) => x !== id) : [...likedQuestions, id] });
      },

      resetDemo: () => {
        const user = get().user;
        set({ ...starterContent(), user, onboarded: true });
      },
    }),
    {
      name: 'pa-donde-vamos',
      version: 3,
      // v2 added reviews, v3 questions; older saved state just gets the new empty fields.
      migrate: (state) => ({ ...initialData, ...(state as object) }) as AppState,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _hydrated, ...rest }) =>
        Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as Data,
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);

/** A friend answers a question thread after `delay` ms, recommending a place (and notifies if it's your question). */
function scheduleAnswerReply(questionId: string, delay: number) {
  const key = `q:${questionId}:${delay}`;
  clearTimeout(replyTimers[key]);
  replyTimers[key] = setTimeout(() => {
    const s = useAppStore.getState();
    if (!s.user) return;
    const mine = s.myQuestions.find((x) => x.id === questionId);
    const question = mine ?? getSeedQuestion(questionId);
    if (!question) return;
    const thread = s.answers[questionId] ?? [];
    const taken = new Set([...seedAnswers.filter((x) => x.questionId === questionId), ...thread].map((x) => x.authorId));
    const pool = questionAutoReplies.filter((r) => r.friendId !== question.authorId && !taken.has(r.friendId));
    const list = pool.length ? pool : questionAutoReplies.filter((r) => r.friendId !== question.authorId);
    const reply = list[answerReplyCount++ % list.length];
    const at = new Date().toISOString();
    const answer: Answer = { id: uid(), questionId, authorId: reply.friendId, text: reply.text, placeId: reply.placeId, at, likes: 0 };
    const patch: Partial<Data> = { answers: { ...s.answers, [questionId]: [...thread, answer] } };
    if (mine) {
      const name = getFriend(reply.friendId)?.name ?? 'Un pana';
      const note: AppNotification = {
        id: uid(),
        kind: 'answer',
        friendId: reply.friendId,
        text: `${name} respondió a tu recomendación ${question.title}`,
        boldParts: [name, question.title],
        target: { kind: 'question', id: questionId },
        at,
        read: false,
      };
      patch.notifications = [note, ...s.notifications];
    }
    useAppStore.setState(patch);
  }, delay);
}

// ---------- Selectors & helpers ----------

export const selectUnreadCount = (s: AppState) => s.notifications.filter((n) => !n.read).length;

/** Upcoming plans (soonest first). */
export const sortPlans = (plans: Plan[]) => [...plans].sort((a, b) => a.date.localeCompare(b.date));

/** Display title for a plan. */
export function planTitle(plan: Plan): string {
  return getPlace(plan.placeId)?.name ?? getEvent(plan.eventId)?.title ?? plan.title ?? 'Plan';
}

/** Soonest plan shared with a friend, if any. */
export function planWithFriend(plans: Plan[], friendId: string): Plan | undefined {
  return sortPlans(plans).find((p) => p.friendIds.includes(friendId));
}
