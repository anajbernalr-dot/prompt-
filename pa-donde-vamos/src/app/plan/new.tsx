import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { FilledIcon, Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { MenuRow } from '@/components/Surfaces';
import { Handwritten } from '@/components/Typography';
import { Asterisk } from '@/components/illustrations';
import { planCategories } from '@/components/plan/meta';
import type { PlanCategory } from '@/data/types';
import { tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius } from '@/theme';

export default function PlanNewScreen() {
  const resetDraft = useAppStore((s) => s.resetDraft);
  const [category, setCategory] = useState<PlanCategory | null>(null);

  const next = () => {
    if (!category) return;
    resetDraft({ category });
    router.push('/plan/place');
  };

  return (
    <Screen footer={<Button label="Siguiente" onPress={next} disabled={!category} />}>
      <Header title="Crear plan" />

      <View style={styles.group} accessibilityRole="radiogroup">
        {planCategories.map((c, i) => {
          const selected = c.key === category;
          return (
            <View key={c.key} style={[styles.rowWrap, selected && styles.rowSelected]}>
              <MenuRow
                label={c.label}
                last={i === planCategories.length - 1}
                onPress={() => {
                  tap();
                  setCategory(c.key);
                }}
                leading={
                  <View style={styles.iconBox}>
                    <FilledIcon name={c.icon} size={23} color={selected ? colors.blue : colors.ink} />
                  </View>
                }
                right={
                  selected ? (
                    <View style={styles.check}>
                      <Icon name="check" size={14} color={colors.white} />
                    </View>
                  ) : undefined
                }
              />
            </View>
          );
        })}
      </View>

      <View style={styles.doodle} pointerEvents="none">
        <Asterisk width={22} style={styles.smallStar} />
        <Handwritten rotate={-9} size={25} style={styles.note}>
          {'Planes\nreales,\ngente real'}
        </Handwritten>
        <Asterisk width={40} style={styles.bigStar} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: 18,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rowWrap: { paddingHorizontal: 16 },
  rowSelected: { backgroundColor: colors.blueSoft },
  iconBox: { width: 28, alignItems: 'center' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doodle: { alignSelf: 'flex-end', width: 220, height: 150, marginTop: 28, marginRight: 4 },
  note: { position: 'absolute', right: 8, top: 0, lineHeight: 30 },
  smallStar: { position: 'absolute', left: 6, top: 62 },
  bigStar: { position: 'absolute', right: 0, bottom: 0 },
});
