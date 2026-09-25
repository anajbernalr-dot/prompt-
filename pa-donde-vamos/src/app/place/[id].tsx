import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetailNotFound } from '@/components/detail/DetailNotFound';
import { useNow } from '@/components/detail/hours';
import { showToast } from '@/components/Toast';
import { HERO_H, StickyHeader, VenueHero } from '@/components/venue/Hero';
import { About, Hours, QuickActions, Tags } from '@/components/venue/Info';
import { LocationSection } from '@/components/venue/Location';
import { OpinionsSection } from '@/components/venue/Opinions';
import { PhotosSection } from '@/components/venue/Photos';
import { InlinePlan, ReadyCta } from '@/components/venue/Plan';
import { FriendGallery, FriendPosts, MenuSection, SimilarPlaces } from '@/components/venue/Social';
import { getPlace } from '@/data/places';
import type { Place } from '@/data/types';
import { getVenueExtras } from '@/data/venueExtras';
import { openDirections, shareText, success, tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, gutter, maxContentWidth } from '@/theme';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = getPlace(id);
  if (!place) {
    return (
      <DetailNotFound
        title="No encontramos este lugar"
        body="Puede que ya no esté en la app o que el enlace esté malo. Échale un ojo a otros sitios."
      />
    );
  }
  return <PlaceDetail key={place.id} place={place} />;
}

function PlaceDetail({ place }: { place: Place }) {
  const extras = getVenueExtras(place);
  const saved = useAppStore((s) => s.savedPlaces.includes(place.id));
  const now = useNow();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const planY = useRef(0);
  const [stuck, setStuck] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const progress = scrollY.interpolate({ inputRange: [HERO_H - 40, HERO_H + 10], outputRange: [0, 1], extrapolate: 'clamp' });

  const toggleSave = () => {
    tap();
    useAppStore.getState().toggleSavePlace(place.id);
    if (saved) showToast('Quitado de tus lugares', 'x');
    else {
      success();
      showToast('Guardado en tus lugares', 'bookmark');
    }
  };
  const share = async () => {
    const shared = await shareText(`${place.name} en ${place.zone} — ¿vamos? 🙌`);
    if (shared && Platform.OS === 'web') showToast('Enlace copiado', 'link');
  };
  const go = () => openDirections(place.lat, place.lng, place.name);
  const toPlan = () => scrollRef.current?.scrollTo({ y: Math.max(planY.current - insets.top - 60, 0), animated: true });

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: Platform.OS !== 'web',
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
            const next = e.nativeEvent.contentOffset.y > HERO_H - 20;
            if (next !== stuck) setStuck(next);
          },
        })}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <VenueHero
          place={place}
          note={extras.heroNote}
          wantCount={extras.wantCount}
          saved={saved}
          onSave={toggleSave}
          onShare={share}
          onMore={toPlan}
          onGo={go}
        />
        <View style={styles.body}>
          <Tags tags={place.tags} />
          <Hours week={extras.week} now={now} />
          <QuickActions place={place} extras={extras} onReserve={toPlan} />
          <About text={place.description} />
          <PhotosSection photos={extras.photos} />
          <LocationSection place={place} note={extras.mapNote} />
          <OpinionsSection place={place} extra={extras.reviews} />
          <FriendPosts posts={extras.posts} zone={place.zone} />
          <MenuSection items={extras.menu} />
          <FriendGallery name={place.name} refs={extras.gallery} note={extras.galleryNote} extra={extras.wantCount} />
          <SimilarPlaces place={place} />
          <ReadyCta place={place} saved={saved} onSave={toggleSave} onCreate={toPlan} />
          <View onLayout={(e) => (planY.current = e.nativeEvent.layout.y)}>
            <InlinePlan place={place} />
          </View>
        </View>
      </Animated.ScrollView>
      <StickyHeader visible={stuck} title={place.name} progress={progress} saved={saved} onSave={toggleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  body: { paddingHorizontal: gutter },
});
