import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts, sizes } from '../theme/typography';
import { Completion } from '../types';
import {
  addCompletion,
  getOrCreateProgress,
  loadAvatar,
  loadCompletions,
  updateProgress,
} from '../storage/avatar';
import { applyCompletion } from '../data/progression';
import { pickAvatarMessage } from '../data/avatarMessages';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ReflectionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Reflection'>>();
  const { task } = route.params;

  const [hard, setHard] = useState('');
  const [surprise, setSurprise] = useState('');
  const [discomfort, setDiscomfort] = useState(5);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    const completion: Completion = {
      id: `${Date.now()}`,
      taskId: task.id,
      completedAt: new Date().toISOString(),
      discomfortScore: discomfort,
      reflectionHard: hard.trim(),
      reflectionSurprise: surprise.trim(),
      wasDeferred: false,
    };
    await addCompletion(completion);
    const all = await loadCompletions();
    const avatar = await loadAvatar();
    const message = pickAvatarMessage(task.level, discomfort);

    if (!avatar) {
      navigation.replace('AvatarMessage', { message, level: task.level });
      return;
    }

    const current = await getOrCreateProgress(task.skillId);
    const next = applyCompletion(task.skillId, current, all);
    await updateProgress(task.skillId, next);

    const justCompletedPath = !current.pathCompletedAt && !!next.pathCompletedAt;
    const levelChanged = next.currentLevel !== current.currentLevel;

    if (justCompletedPath) {
      navigation.replace('PathCompleted', { skillId: task.skillId });
    } else if (levelChanged) {
      navigation.replace('LevelUp', { newLevel: next.currentLevel, avatarMessage: message });
    } else {
      navigation.replace('AvatarMessage', { message, level: next.currentLevel });
    }
  }

  function attemptBack() {
    const hasInput = hard.trim().length > 0 || surprise.trim().length > 0 || discomfort !== 5;
    if (!hasInput) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Выйти без сохранения?',
      'Рефлексия не будет записана. Задание останется невыполненным.',
      [
        { text: 'Остаться', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: () => navigation.goBack() },
      ],
    );
  }

  return (
    <Screen scroll>
      <Header onBack={attemptBack} title="рефлексия" />
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Text variant="displayLg" style={styles.title}>Что осталось внутри?</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.q}>что было самым сложным?</Text>
        <TextInput
          value={hard}
          onChangeText={setHard}
          multiline
          maxLength={500}
          placeholder="опиши, что зацепилось"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        <Text variant="monoSm" style={styles.counter}>{hard.length}/500</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.q}>что удивило?</Text>
        <TextInput
          value={surprise}
          onChangeText={setSurprise}
          multiline
          maxLength={500}
          placeholder="что оказалось не так, как ты ожидал"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        <Text variant="monoSm" style={styles.counter}>{surprise.length}/500</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.q}>насколько было некомфортно?</Text>
        <View style={styles.scale}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <Pressable
              key={n}
              onPress={() => setDiscomfort(n)}
              style={[styles.scaleDot, n === discomfort && styles.scaleDotActive]}
            >
              <Text
                style={[
                  styles.scaleNum,
                  n === discomfort && styles.scaleNumActive,
                ]}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.cta}>
        <Button label="Сохранить" onPress={save} disabled={saving} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    marginTop: 10,
  },
  section: {
    marginBottom: 28,
  },
  q: {
    marginBottom: 12,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: sizes.base,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  counter: {
    marginTop: 4,
    textAlign: 'right',
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleDot: {
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scaleDotActive: {
    borderBottomColor: colors.accent,
  },
  scaleNum: {
    fontFamily: fonts.mono,
    fontSize: sizes.sm,
    color: colors.textDim,
  },
  scaleNumActive: {
    color: colors.accent,
  },
  cta: {
    marginTop: 12,
  },
});
