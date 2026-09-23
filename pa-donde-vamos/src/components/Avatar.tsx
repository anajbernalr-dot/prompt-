import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { avatarImage } from '@/data/images';
import { initials } from '@/lib/format';
import { colors, fonts } from '@/theme';

import { AppText } from './Typography';

const tints = ['#E4C9A8', '#CFD8F7', '#E9C3B5', '#D4E0C8', '#EAD9A6', '#D9CCE8'];

export function Avatar({
  name,
  image,
  size = 44,
  ring = false,
  online = false,
  style,
}: {
  name: string;
  /** Key into `images.avatars`. Falls back to initials. */
  image?: string | null;
  size?: number;
  /** Cream border — used when avatars overlap. */
  ring?: boolean;
  online?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const src = avatarImage(image);
  const tint = tints[(name.charCodeAt(0) + name.length) % tints.length];
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        ring && { borderWidth: 2, borderColor: colors.background },
        style,
      ]}>
      {src ? (
        <Image
          source={src}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
          contentFit="cover"
          transition={150}
          accessibilityLabel={name}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.initials, { borderRadius: size / 2, backgroundColor: tint }]}>
          <AppText style={{ fontFamily: fonts.sansSemi, fontSize: size * 0.38, color: colors.ink }}>
            {initials(name)}
          </AppText>
        </View>
      )}
      {online ? (
        <View
          style={[
            styles.online,
            { width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13, right: 0, bottom: 0 },
          ]}
        />
      ) : null}
    </View>
  );
}

/** Overlapping avatars followed by an optional "+N" bubble. */
export function AvatarStack({
  people,
  size = 34,
  max = 3,
  extra = 0,
  style,
}: {
  people: { name: string; avatar?: string | null }[];
  size?: number;
  max?: number;
  /** Additional count to add to the "+N" bubble. */
  extra?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length + extra;
  return (
    <View style={[styles.stack, style]}>
      {shown.map((p, i) => (
        <Avatar
          key={p.name + i}
          name={p.name}
          image={p.avatar}
          size={size}
          ring
          style={{ marginLeft: i === 0 ? 0 : -size * 0.28 }}
        />
      ))}
      {rest > 0 ? (
        <View
          style={[
            styles.more,
            { width: size, height: size, borderRadius: size / 2, marginLeft: shown.length ? -size * 0.28 : 0 },
          ]}>
          <AppText style={{ fontFamily: fonts.sansSemi, fontSize: size * 0.34, color: colors.textMuted }}>
            +{rest}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  initials: { alignItems: 'center', justifyContent: 'center' },
  online: { position: 'absolute', backgroundColor: '#3BB273', borderWidth: 2, borderColor: colors.background },
  stack: { flexDirection: 'row', alignItems: 'center' },
  more: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
