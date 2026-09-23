import type { Friend } from './types';

export const friends: Friend[] = [
  { id: 'anasofi', name: 'Ana Sofi', handle: 'anasofi', avatar: 'anasofi', online: true },
  { id: 'luisv', name: 'Luis V.', handle: 'luisv', avatar: 'luisv', online: true },
  { id: 'sofir', name: 'Sofi R.', handle: 'sofir', avatar: 'sofir', online: false },
  { id: 'valeria', name: 'Valeria', handle: 'valeria', avatar: 'valeria', online: false },
  { id: 'carlam', name: 'Carla M.', handle: 'carla.m', avatar: 'carlam', online: true },
  { id: 'diegop', name: 'Diego P.', handle: 'diegop', avatar: 'diegop', online: false },
  { id: 'gabo', name: 'Gabo', handle: 'gabo.ccs', avatar: 'gabo', online: true },
  { id: 'mariaf', name: 'María F.', handle: 'mariaf', avatar: 'mariaf', online: false },
];

export const getFriend = (id?: string) => friends.find((f) => f.id === id);
