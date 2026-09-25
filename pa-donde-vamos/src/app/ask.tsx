import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { goBack } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { AskScene } from '@/components/illustrations';
import { Screen } from '@/components/Screen';
import { showToast } from '@/components/Toast';
import { AppText, Title } from '@/components/Typography';
import { success } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

const MAX = 250;

export default function AskScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Caracas');
  const [body, setBody] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const canPost = title.trim().length > 0;

  const publish = () => {
    if (!canPost) return;
    useAppStore.getState().addQuestion({ title, location, body });
    success();
    showToast('¡Listo! Tus panas ya lo pueden ver', 'check');
    goBack('/');
  };

  const close = () => (router.canGoBack() ? router.dismissTo('/') : router.replace('/'));

  return (
    <Screen
      keyboard
      footer={<Button label="Publicar" iconRight="arrow-right" onPress={publish} disabled={!canPost} />}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconSize={24} accessibilityLabel="Volver" onPress={() => goBack('/')} style={{ marginLeft: -8 }} />
        <AppText style={styles.headerTitle}>Crear recomendación</AppText>
        <IconButton icon="x" iconSize={24} accessibilityLabel="Cerrar" onPress={close} style={{ marginRight: -8 }} />
      </View>

      <AskScene width={230} style={styles.art} />

      <Title level={1} style={styles.h1}>
        ¿Qué recomendaciones buscas?
      </Title>
      <AppText style={styles.lead}>
        Cuéntales a tus panas qué estás buscando. Pueden recomendarte lugares, planes, eventos y más.
      </AppText>

      <AppText style={styles.label}>Título</AppText>
      <View style={[styles.box, focus === 't' && styles.focused]}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          maxLength={80}
          placeholder="¿Dónde brunch el domingo?"
          placeholderTextColor={colors.placeholder}
          onFocus={() => setFocus('t')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Título"
          style={styles.input}
        />
      </View>

      <AppText style={styles.label}>Ubicación</AppText>
      <View style={[styles.box, focus === 'l' && styles.focused]}>
        <Icon name="map-pin" size={17} color={colors.textMuted} />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="¿Dónde?"
          placeholderTextColor={colors.placeholder}
          onFocus={() => setFocus('l')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Ubicación"
          style={styles.input}
        />
        {location ? (
          <IconButton icon="x" iconSize={17} size={36} color={colors.textMuted} accessibilityLabel="Borrar ubicación" onPress={() => setLocation('')} style={{ marginRight: -10 }} />
        ) : null}
      </View>

      <AppText style={styles.label}>Cuéntales qué buscas</AppText>
      <View style={[styles.box, styles.area, focus === 'b' && styles.focused]}>
        <TextInput
          value={body}
          onChangeText={(t) => setBody(t.slice(0, MAX))}
          maxLength={MAX}
          multiline
          placeholder="Quiero algo bonito pero relajado, no demasiado caro."
          placeholderTextColor={colors.placeholder}
          onFocus={() => setFocus('b')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Cuéntales qué buscas"
          style={[styles.input, styles.areaInput]}
        />
      </View>
      <AppText style={styles.counter}>
        {body.length}/{MAX}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: fonts.serifBold, fontSize: 19, color: colors.ink },
  art: { alignSelf: 'center', marginTop: 6, marginBottom: 10 },
  h1: { fontSize: 30, lineHeight: 35 },
  lead: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21.5, color: colors.inkSoft, marginTop: 10, marginBottom: 8 },
  label: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink, marginTop: 18, marginBottom: 8 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  focused: { borderColor: colors.ink },
  input: { flex: 1, minHeight: 50, fontFamily: fonts.sans, fontSize: 15.5, color: colors.text, outlineStyle: 'none' } as object,
  area: { alignItems: 'flex-start', paddingVertical: 12 },
  areaInput: { minHeight: 96, textAlignVertical: 'top' } as object,
  counter: { alignSelf: 'flex-end', fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, marginTop: 6 },
});
