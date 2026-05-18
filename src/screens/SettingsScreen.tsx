import React from 'react';
import { View, StyleSheet, Pressable, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { clearAll } from '../storage/avatar';
import appJson from '../../app.json';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const VERSION = appJson.expo.version;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();

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

        <View style={[styles.row, styles.rowDisabled]}>
          <View style={styles.rowBody}>
            <Text variant="body" style={styles.rowTitle}>напоминать о задании</Text>
            <Text variant="monoSm" style={styles.rowHint}>скоро · push для android</Text>
          </View>
          <Switch
            value={false}
            disabled
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.textFaint}
          />
        </View>

        <View style={[styles.row, styles.rowDisabled]}>
          <View style={styles.rowBody}>
            <Text variant="body" style={styles.rowTitle}>время напоминания</Text>
            <Text variant="monoSm" style={styles.rowHint}>не выбрано</Text>
          </View>
          <Text variant="mono" style={styles.rowMutedValue}>—</Text>
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
            Самопрограммирование через действие, не контент. Выбираешь навык — получаешь задания
            с нарастающим дискомфортом. Меняешься тем, что делаешь.
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
  rowDisabled: {
    opacity: 0.55,
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
  rowMutedValue: {
    color: colors.textDim,
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
