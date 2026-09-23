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
