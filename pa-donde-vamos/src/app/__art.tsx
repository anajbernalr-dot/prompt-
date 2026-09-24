import { View } from 'react-native';

import {
  Asterisk,
  Burst,
  CheersScene,
  GlassesDoodle,
  GoogleLogo,
  LeafDoodle,
  PalmSunScene,
  Swoosh,
  WelcomeScene,
} from '@/components/illustrations';
import { Screen } from '@/components/Screen';

export default function Art() {
  return (
    <Screen>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center', paddingVertical: 16 }}>
        <GlassesDoodle width={80} />
        <Asterisk width={28} />
        <Asterisk width={48} />
        <Burst width={56} />
        <Swoosh width={120} />
        <LeafDoodle width={64} />
        <GoogleLogo width={40} />
      </View>
      <CheersScene width={260} />
      <WelcomeScene width={320} />
      <PalmSunScene width={300} />
    </Screen>
  );
}
