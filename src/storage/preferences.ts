import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mindprog:preferences';

export type Preferences = {
  /** Показывать подтверждение при тапе по неактивной ветке развития. */
  confirmSkillSwitch: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  confirmSkillSwitch: true,
};

function normalize(raw: Partial<Preferences> | undefined): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  return {
    confirmSkillSwitch:
      typeof raw.confirmSkillSwitch === 'boolean'
        ? raw.confirmSkillSwitch
        : DEFAULT_PREFERENCES.confirmSkillSwitch,
  };
}

export async function loadPreferences(): Promise<Preferences> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(normalize(prefs)));
}

export async function setConfirmSkillSwitch(value: boolean): Promise<void> {
  const prefs = await loadPreferences();
  await savePreferences({ ...prefs, confirmSkillSwitch: value });
}

export async function clearPreferences(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
