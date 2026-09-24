import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Segmented } from '@/components/Fields';
import { SavedEventsList, SavedPlacesList, SavedPlansList } from '@/components/saved/SavedLists';
import { Screen } from '@/components/Screen';
import { Title } from '@/components/Typography';

type Tab = 'lugares' | 'eventos' | 'planes';

const TABS: readonly { key: Tab; label: string }[] = [
  { key: 'lugares', label: 'Lugares' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'planes', label: 'Planes' },
];

function parseTab(raw?: string | string[]): Tab {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  return value === 'eventos' || value === 'planes' ? value : 'lugares';
}

export default function SavedScreen() {
  const { tab: rawTab } = useLocalSearchParams<{ tab?: string }>();
  const param = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const [tab, setTab] = useState<Tab>(parseTab(param));
  const [seenParam, setSeenParam] = useState(param);

  // The tab stays mounted: follow ?tab= when another screen links here.
  if (seenParam !== param) {
    setSeenParam(param);
    setTab(parseTab(param));
  }

  const onChange = (key: Tab) => {
    setTab(key);
    router.setParams({ tab: key });
  };

  return (
    <Screen safeBottom={false}>
      <Title style={styles.title}>Guardados</Title>
      <Segmented options={TABS} value={tab} onChange={onChange} style={styles.segmented} />
      {tab === 'lugares' ? <SavedPlacesList /> : tab === 'eventos' ? <SavedEventsList /> : <SavedPlansList />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 12 },
  segmented: { marginTop: 18, marginBottom: 18 },
});
