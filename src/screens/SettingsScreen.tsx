import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert, Switch, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { clearAll } from '../storage/avatar';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
  DEFAULT_SETTINGS,
} from '../storage/notifications';
import {
  loadPreferences,
  setConfirmSkillSwitch,
  clearPreferences,
  DEFAULT_PREFERENCES,
  type Preferences,
} from '../storage/preferences';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../lib/notifications';
import appJson from '../../app.json';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const VERSION = appJson.expo.version;
const MINUTE_STEP = 5;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, p] = await Promise.all([loadNotificationSettings(), loadPreferences()]);
      setPrefs(p);
      if (s.enabled) {
        const perm = await Notifications.getPermissionsAsync();
        if (!perm.granted) {
          const fixed = { ...s, enabled: false };
          await saveNotificationSettings(fixed);
          await cancelDailyReminder();
          setSettings(fixed);
          setLoaded(true);
          return;
        }
      }
      setSettings(s);
      setLoaded(true);
    })();
  }, []);

  async function onToggleConfirmSwitch(value: boolean) {
    setPrefs({ ...prefs, confirmSkillSwitch: value });
    await setConfirmSkillSwitch(value);
  }

  async function applySettings(next: NotificationSettings) {
    setSettings(next);
    await saveNotificationSettings(next);
    if (next.enabled) {
      await scheduleDailyReminder(next.hour, next.minute);
    } else {
      await cancelDailyReminder();
    }
  }

  async function onToggle(value: boolean) {
    if (!value) {
      await applySettings({ ...settings, enabled: false });
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Нужно разрешение',
        'Разреши Грани присылать уведомления в настройках системы — без этого напоминание не сработает.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    await applySettings({ ...settings, enabled: true });
  }

  async function bumpHour(delta: number) {
    const hour = (settings.hour + delta + 24) % 24;
    await applySettings({ ...settings, hour });
  }

  async function bumpMinute(delta: number) {
    const total = settings.minute + delta * MINUTE_STEP;
    const minute = ((total % 60) + 60) % 60;
    await applySettings({ ...settings, minute });
  }

  function comingSoon(title: string) {
    Alert.alert(title, 'Скоро.');
  }

  function resetAll() {
    Alert.alert(
      'Удалить аватара?',
      'Сотрётся всё: имя, прогресс по всем навыкам, журнал. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await cancelDailyReminder();
            await saveNotificationSettings(DEFAULT_SETTINGS);
            await clearPreferences();
            await clearAll();
            const root = navigation.getParent() ?? navigation;
            root.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ],
    );
  }

  return (
    <Screen scroll>
      <Header onBack={() => navigation.goBack()} title="настройки" />

      <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>уведомления</Text>

        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text variant="body" style={styles.rowTitle}>напоминать о задании</Text>
            <Text variant="monoSm" style={styles.rowHint}>
              {settings.enabled ? `каждый день в ${pad(settings.hour)}:${pad(settings.minute)}` : 'выключено'}
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            disabled={!loaded}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={settings.enabled ? colors.text : colors.textFaint}
          />
        </View>

        {settings.enabled && (
          <Animated.View entering={FadeIn.duration(280)} style={styles.pickerBlock}>
            <TimeColumn label="часы" value={settings.hour} onUp={() => bumpHour(1)} onDown={() => bumpHour(-1)} />
            <Text variant="mono" style={styles.pickerSeparator}>:</Text>
            <TimeColumn label="минуты" value={settings.minute} onUp={() => bumpMinute(1)} onDown={() => bumpMinute(-1)} />
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>поведение</Text>

        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text variant="body" style={styles.rowTitle}>подтверждать смену навыка</Text>
            <Text variant="monoSm" style={styles.rowHint}>
              {prefs.confirmSkillSwitch ? 'спрашивать перед переключением' : 'переключать сразу'}
            </Text>
          </View>
          <Switch
            value={prefs.confirmSkillSwitch}
            disabled={!loaded}
            onValueChange={onToggleConfirmSwitch}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={prefs.confirmSkillSwitch ? colors.text : colors.textFaint}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>о приложении</Text>

        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text variant="body" style={styles.rowTitle}>Грань</Text>
            <Text variant="monoSm" style={styles.rowHint}>версия {VERSION}</Text>
          </View>
        </View>

        <View style={styles.aboutBlock}>
          <Text variant="bodyDim" style={styles.aboutText}>
            Грань — о том, что человека меняет не чтение, а действие. Выбираешь один навык
            и каждый день делаешь по одному маленькому шагу — по размеру выполнимый,
            по весу непривычный.
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>правовое</Text>
        <NavRow label="политика конфиденциальности" onPress={() => comingSoon('Политика конфиденциальности')} />
        <NavRow label="условия использования" onPress={() => comingSoon('Условия использования')} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>связь</Text>
        <NavRow label="написать автору" onPress={() => navigation.navigate('Feedback')} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>опасная зона</Text>
        <View style={styles.dangerBlock}>
          <Text variant="bodyDim" style={styles.dangerText}>
            Удаление аватара стирает имя, прогресс по всем навыкам и журнал. Восстановить нельзя.
          </Text>
          <Button label="Удалить аватара" variant="ghost" onPress={resetAll} />
        </View>
      </Animated.View>
    </Screen>
  );
}

function TimeColumn({
  label,
  value,
  onUp,
  onDown,
}: {
  label: string;
  value: number;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <View style={styles.timeColumn}>
      <Pressable onPress={onUp} hitSlop={12} style={styles.timeArrow}>
        <ChevronUp size={20} color={colors.textDim} />
      </Pressable>
      <Text variant="mono" style={styles.timeValue}>{pad(value)}</Text>
      <Pressable onPress={onDown} hitSlop={12} style={styles.timeArrow}>
        <ChevronDown size={20} color={colors.textDim} />
      </Pressable>
      <Text variant="monoSm" style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

function NavRow({ label, hint, onPress }: { label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowBody}>
        <Text variant="body" style={styles.rowTitle}>{label}</Text>
        {!!hint && <Text variant="monoSm" style={styles.rowHint}>{hint}</Text>}
      </View>
      <ChevronRight size={18} color={colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    marginBottom: 4,
  },
  rowHint: {
    color: colors.textDim,
  },
  pickerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 24,
  },
  pickerSeparator: {
    fontSize: 32,
    color: colors.textDim,
    marginTop: -28,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 8,
  },
  timeArrow: {
    paddingVertical: 4,
  },
  timeValue: {
    fontSize: 32,
    color: colors.text,
    minWidth: 56,
    textAlign: 'center',
  },
  timeLabel: {
    color: colors.textDim,
    marginTop: 4,
  },
  aboutBlock: {
    marginTop: 16,
  },
  aboutText: {
    lineHeight: 22,
  },
  dangerBlock: {
    gap: 16,
    paddingTop: 8,
  },
  dangerText: {
    lineHeight: 20,
  },
});
