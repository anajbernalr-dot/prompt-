import type { ImageSourcePropType } from 'react-native';

// All photos are bundled locally so the app works offline and without API keys.
// To use real photos, replace the files in assets/photos keeping the same names.

export const placeImages: Record<string, ImageSourcePropType> = {
  tostao: require('@/assets/photos/places/tostao.jpg'),
  'la-bodeguita': require('@/assets/photos/places/la-bodeguita.jpg'),
  'brunch-chacao': require('@/assets/photos/places/brunch-chacao.jpg'),
  'brunch-mamey': require('@/assets/photos/places/brunch-mamey.jpg'),
  'el-barco': require('@/assets/photos/places/el-barco.jpg'),
  'resto-11': require('@/assets/photos/places/resto-11.jpg'),
  'bar-sin-nombre': require('@/assets/photos/places/bar-sin-nombre.jpg'),
  'restaurante-1884': require('@/assets/photos/places/restaurante-1884.jpg'),
  'ciento-once': require('@/assets/photos/places/ciento-once.jpg'),
  'el-techo': require('@/assets/photos/places/el-techo.jpg'),
  'cafe-avila': require('@/assets/photos/places/cafe-avila.jpg'),
  'la-guacamaya': require('@/assets/photos/places/la-guacamaya.jpg'),
};

export const eventImages: Record<string, ImageSourcePropType> = {
  'jazz-candelaria': require('@/assets/photos/events/jazz-candelaria.jpg'),
  'arte-galpones': require('@/assets/photos/events/arte-galpones.jpg'),
  'cine-parque': require('@/assets/photos/events/cine-parque.jpg'),
  'mercado-diseno': require('@/assets/photos/events/mercado-diseno.jpg'),
};

export const avatarImages: Record<string, ImageSourcePropType> = {
  anajulia: require('@/assets/photos/avatars/anajulia.jpg'),
  anasofi: require('@/assets/photos/avatars/anasofi.jpg'),
  luisv: require('@/assets/photos/avatars/luisv.jpg'),
  sofir: require('@/assets/photos/avatars/sofir.jpg'),
  valeria: require('@/assets/photos/avatars/valeria.jpg'),
  carlam: require('@/assets/photos/avatars/carlam.jpg'),
  diegop: require('@/assets/photos/avatars/diegop.jpg'),
  gabo: require('@/assets/photos/avatars/gabo.jpg'),
  mariaf: require('@/assets/photos/avatars/mariaf.jpg'),
};

export const placeImage = (key: string) => placeImages[key];
export const eventImage = (key: string) => eventImages[key];
export const avatarImage = (key?: string | null) => (key ? avatarImages[key] : undefined);

export const dishImages: Record<string, ImageSourcePropType> = {
  'avo-toast': require('@/assets/photos/dishes/avo-toast.jpg'),
  pancakes: require('@/assets/photos/dishes/pancakes.jpg'),
  cappuccino: require('@/assets/photos/dishes/cappuccino.jpg'),
  tostado: require('@/assets/photos/dishes/tostado.jpg'),
  matcha: require('@/assets/photos/dishes/matcha.jpg'),
  arepa: require('@/assets/photos/dishes/arepa.jpg'),
  cachapa: require('@/assets/photos/dishes/cachapa.jpg'),
  pargo: require('@/assets/photos/dishes/pargo.jpg'),
  tequenos: require('@/assets/photos/dishes/tequenos.jpg'),
  mojito: require('@/assets/photos/dishes/mojito.jpg'),
  cocktail: require('@/assets/photos/dishes/cocktail.jpg'),
  'flat-white': require('@/assets/photos/dishes/flat-white.jpg'),
  croissant: require('@/assets/photos/dishes/croissant.jpg'),
  burger: require('@/assets/photos/dishes/burger.jpg'),
};

/** Generic venue shots used for photo grids / friend galleries. */
export const galleryImages: Record<string, ImageSourcePropType> = {
  'cafe-table': require('@/assets/photos/gallery/cafe-table.jpg'),
  'latte-art': require('@/assets/photos/gallery/latte-art.jpg'),
  pastries: require('@/assets/photos/gallery/pastries.jpg'),
  facade: require('@/assets/photos/gallery/facade.jpg'),
  terrace: require('@/assets/photos/gallery/terrace.jpg'),
  'bar-counter': require('@/assets/photos/gallery/bar-counter.jpg'),
  'friends-table': require('@/assets/photos/gallery/friends-table.jpg'),
  'night-patio': require('@/assets/photos/gallery/night-patio.jpg'),
};
