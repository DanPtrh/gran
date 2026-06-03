import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mindprog:notifications';

export type NotificationSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
};

function normalize(raw: Partial<NotificationSettings> | undefined): NotificationSettings {
  if (!raw) return DEFAULT_SETTINGS;
  const hour = Number.isFinite(raw.hour) ? Math.max(0, Math.min(23, raw.hour as number)) : DEFAULT_SETTINGS.hour;
  const minute = Number.isFinite(raw.minute) ? Math.max(0, Math.min(59, raw.minute as number)) : DEFAULT_SETTINGS.minute;
  return {
    enabled: Boolean(raw.enabled),
    hour,
    minute,
  };
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(normalize(settings)));
}
