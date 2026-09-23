import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Icon } from './Icon';
import { AppText } from './Typography';

type FieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  /** Adds the eye toggle for passwords. */
  secureToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Labeled pill input ("Nombre completo", "Correo electrónico", "Contraseña"). */
export const TextField = forwardRef<TextInput, FieldProps>(function TextField(
  { label, error, secureToggle, containerStyle, style, ...rest },
  ref,
) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, containerStyle]}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: colors.ink },
          !!error && { borderColor: colors.danger },
        ]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureToggle ? hidden : rest.secureTextEntry}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}>
            <Icon name={hidden ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="small" color={colors.danger} style={{ marginTop: 6, marginLeft: 4 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

/** "Busca un lugar, plan o antojo…" */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Busca un lugar, plan o antojo…',
  onSubmit,
  onPress,
  autoFocus,
  style,
}: {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  /** When set, the bar acts as a button (no typing) — e.g. on Home it opens Explorar. */
  onPress?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inner = (
    <View style={[styles.search, style]}>
      <Icon name="search" size={19} color={colors.text} />
      {onPress ? (
        <AppText style={styles.searchPlaceholder} numberOfLines={1}>
          {placeholder}
        </AppText>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          autoCorrect={false}
          style={styles.searchInput}
        />
      )}
      {value ? (
        <Pressable accessibilityLabel="Borrar búsqueda" hitSlop={10} onPress={() => onChangeText?.('')}>
          <Icon name="x" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable accessibilityRole="search" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      {inner}
    </Pressable>
  );
}

/** Square checkbox — blue when checked (¿Con quién vas?). */
export function Checkbox({ checked, size = 24 }: { checked: boolean; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: checked ? colors.blue : colors.borderStrong,
        backgroundColor: checked ? colors.blue : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {checked ? <Icon name="check" size={size * 0.7} color={colors.white} /> : null}
    </View>
  );
}

/** Two/three-way pill toggle (Mapa | Lista, Lugares | Eventos | Planes). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmented, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.key)}
            style={[styles.segment, active && styles.segmentActive]}>
            <AppText
              style={{
                fontFamily: active ? fonts.sansSemi : fonts.sansMedium,
                fontSize: 14,
                color: active ? colors.white : colors.textMuted,
              }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.sans,
    fontSize: 15.5,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    gap: 12,
  },
  searchPlaceholder: { flex: 1, fontSize: 15, color: colors.textMuted },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 4,
  },
  segment: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.ink },
});
