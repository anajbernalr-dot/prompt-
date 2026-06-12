import { browser } from '$app/environment';
import { db, type Room } from '$lib/db';

let _room = $state<Room | null>(null);
let _loaded = $state(false);

export const CODE_RE = /^[A-ZÑ]+-[A-ZÑ]+-\d{4}$/;

const WORDS_A = ['BAZAR', 'FERIA', 'MERCADO', 'PLAZA', 'EXPO', 'FIESTA'];
const WORDS_B = ['VERDE', 'ROJO', 'AZUL', 'DORADO', 'BLANCO', 'NEGRO', 'SOLAR'];

export function generateRoomCode(): string {
  const a = WORDS_A[Math.floor(Math.random() * WORDS_A.length)];
  const b = WORDS_B[Math.floor(Math.random() * WORDS_B.length)];
  return `${a}-${b}-${new Date().getFullYear()}`;
}

export const room = {
  get current() { return _room; },
  get loaded() { return _loaded; },
  get code() { return _room?.code ?? null; },
  get feePct() { return _room?.festivalFeePct ?? 0.18; },
  get breakEvenTarget() { return _room?.breakEvenTarget ?? 250; },

  async load() {
    if (!browser) return;
    _room = (await db.rooms.toCollection().last()) ?? null;
    _loaded = true;
  },

  async join(code: string, opts?: { isOrganizer?: boolean; eventName?: string; breakEvenTarget?: number }) {
    const r: Room = {
      code,
      eventName: opts?.eventName ?? code.replaceAll('-', ' '),
      breakEvenTarget: opts?.breakEvenTarget ?? 250,
      festivalFeePct: 0.18,
      isOrganizer: opts?.isOrganizer ?? false,
      joinedAt: new Date(),
    };
    const id = await db.rooms.add(r);
    _room = { ...r, id };
  },

  async update(patch: Partial<Room>) {
    if (!_room?.id) return;
    await db.rooms.update(_room.id, patch);
    _room = { ..._room, ...patch };
  },

  async leave() {
    await db.rooms.clear();
    _room = null;
  },
};
