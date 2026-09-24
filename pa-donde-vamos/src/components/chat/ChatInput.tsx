import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { IconButton } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { colors, fonts, radius } from '@/theme';

/** Pill input + blue round send button. Enter submits. */
export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const empty = text.trim().length === 0;

  const submit = () => {
    if (empty) return;
    onSend(text);
    setText('');
  };

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Icon name="message-circle" size={19} color={colors.textMuted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="send"
          submitBehavior="submit"
          onSubmitEditing={submit}
          accessibilityLabel="Escribe un mensaje"
          style={styles.input}
        />
      </View>
      <IconButton
        icon="arrow-right"
        iconSize={22}
        size={52}
        color={colors.white}
        background={empty ? colors.blueSoft : colors.blue}
        accessibilityLabel="Enviar mensaje"
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, height: '100%', fontFamily: fonts.sans, fontSize: 15.5, color: colors.text, outlineStyle: 'none' },
});
