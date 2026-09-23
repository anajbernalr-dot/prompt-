import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

/** Opens turn-by-turn directions in Google Maps (web, Android) or Apple Maps (iOS). */
export async function openDirections(lat: number, lng: number, label: string) {
  const q = encodeURIComponent(label);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lng}&q=${q}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
  try {
    await Linking.openURL(url);
  } catch {
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  }
}

/** Native share sheet; on web falls back to the Web Share API or clipboard. Returns true if shared/copied. */
export async function shareText(message: string, title = "Pa' Donde Vamos Hoy?"): Promise<boolean> {
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, text: message });
        return true;
      } catch (e) {
        // The user closed the share sheet: don't also copy.
        if ((e as Error)?.name === 'AbortError') return false;
      }
    }
    try {
      await nav?.clipboard?.writeText(message);
      return !!nav?.clipboard;
    } catch {
      return false;
    }
  }
  try {
    const res = await Share.share({ message, title });
    return res.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}

/** Light haptic tap (no-op on web). */
export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export function success() {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
