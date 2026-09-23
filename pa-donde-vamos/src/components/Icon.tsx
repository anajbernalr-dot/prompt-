import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors } from '@/theme';

export type IconName = ComponentProps<typeof Feather>['name'];
export type FilledIconName = ComponentProps<typeof Ionicons>['name'];

/** Thin outline icon (Feather) — the default icon style of the design. */
export function Icon({ name, size = 20, color = colors.text }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

/** Filled icon (Ionicons) — for active tabs, filled hearts/bookmarks, stars. */
export function FilledIcon({
  name,
  size = 20,
  color = colors.text,
}: {
  name: FilledIconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
