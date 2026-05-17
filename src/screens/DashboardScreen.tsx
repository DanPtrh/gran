import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { ProgressOrb } from '../components/ProgressOrb';
import { LevelProgress } from '../components/LevelProgress';
import { colors } from '../theme/colors';
import { sizes } from '../theme/typography';
import { Avatar, Task, Completion, SkillProgress } from '../types';
import {
  getOrCreateProgress,
  loadAvatar,
  loadCompletions,
  updateProgress,
} from '../storage/avatar';
import {
  pickTaskForToday,
  LEVEL_RULES,
  MAX_DEFERRALS,
  computeStreak,
} from '../data/progression';
import { getSkill } from '../data/skills';
import { getTaskById } from '../data/tasks';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

function daysOnPath(iso: string): number {
  const start = new Date(iso);
  const startKey = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const now = new Date();
  const nowKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(1, Math.round((nowKey - startKey) / 86400000) + 1);
}

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [progress, setProgress] = useState<SkillProgress | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [doneToday, setDoneToday] = useState(false);

  const refresh = useCallback(async () => {
    const a = await loadAvatar();
    if (!a) {
      const root = navigation.getParent() ?? navigation;
      root.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      return;
    }
    const p = await getOrCreateProgress(a.activeSkillId);
    const cs = await loadCompletions();
    setAvatar(a);
    setProgress(p);
    setCompletions(cs);
    const t = pickTaskForToday(a.activeSkillId, p, cs);
    setTask(t);
    setDoneToday(t === null);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (!avatar || !progress) {
    return <Screen><View /></Screen>;
  }

  const skill = getSkill(avatar.activeSkillId);
  const rule = LEVEL_RULES[progress.currentLevel];
  const progressFrac = Math.min(1, progress.levelProgress / rule.needed);
  const streak = computeStreak(avatar.activeSkillId, completions);
  const completedOnSkill = completions.filter(
    (c) => getTaskById(c.taskId)?.skillId === avatar.activeSkillId,
  ).length;

  async function deferTask() {
    if (!avatar || !progress || !task) return;
    if (progress.deferralsUsed >= MAX_DEFERRALS) return;
    const nextProgress: SkillProgress = {
      ...progress,
      deferralsUsed: progress.deferralsUsed + 1,
      deferredUntil: new Date().toISOString(),
    };
    await updateProgress(avatar.activeSkillId, nextProgress);
    setProgress(nextProgress);
    setTask(null);
    setDoneToday(true);
  }

  return (
    <Screen scroll>
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Text variant="monoSm">{skill?.name}</Text>
        <Text variant="displayLg" style={styles.name}>{avatar.name}</Text>
        <Text variant="monoSm" style={styles.dayCounter}>
          день {daysOnPath(progress.startedAt)} пути
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(150).duration(700)} style={styles.orbWrap}>
        <ProgressOrb level={progress.currentLevel} progress={progressFrac} />
        <LevelProgress
          current={progress.levelProgress}
          needed={rule.needed}
          label={progress.currentLevel < 5
            ? `до уровня ${ROMAN[progress.currentLevel + 1]}`
            : 'последний уровень'}
        />
      </Animated.View>

      <View style={styles.stats}>
        <Stat label="стрик" value={`${streak}`} />
        <Stat label="выполнено" value={`${completedOnSkill}`} />
        <Stat label="переносов" value={`${progress.deferralsUsed}/${MAX_DEFERRALS}`} />
      </View>

      {task && !doneToday ? (
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.taskCard}>
          <Text variant="label">задание дня</Text>
          <Text variant="displayLg" style={styles.taskTitle}>{task.title}</Text>
          <Text variant="bodyDim" style={styles.taskDesc} numberOfLines={3}>
            {task.description}
          </Text>
          <View style={styles.taskFooter}>
            <DifficultyDots value={task.difficulty} />
            <Button
              label="Открыть"
              variant="ghost"
              onPress={() => navigation.navigate('TaskDetail', { task })}
              style={styles.openBtn}
            />
          </View>
          {progress.deferralsUsed < MAX_DEFERRALS && (
            <Pressable onPress={deferTask} style={styles.deferBtn}>
              <Text variant="monoSm">перенести на завтра</Text>
            </Pressable>
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(600)} style={styles.donePanel}>
          <Text variant="label">сегодня</Text>
          <Text variant="display" style={styles.doneTitle}>
            {doneToday ? 'Задание на сегодня закрыто.\nВозвращайся завтра.' : 'Контент уровня исчерпан.'}
          </Text>
        </Animated.View>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="mono" style={styles.statValue}>{value}</Text>
      <Text variant="monoSm">{label}</Text>
    </View>
  );
}

function DifficultyDots({ value }: { value: number }) {
  return (
    <View style={styles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[styles.dot, i <= value && styles.dotFilled]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  name: {
    marginTop: 4,
  },
  dayCounter: {
    marginTop: 10,
  },
  orbWrap: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  statValue: {
    fontSize: sizes.lg,
    color: colors.text,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 24,
    backgroundColor: colors.backgroundElevated,
  },
  taskTitle: {
    marginTop: 12,
  },
  taskDesc: {
    marginTop: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  openBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  deferBtn: {
    marginTop: 18,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  dotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  donePanel: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 14,
  },
  doneTitle: {
    textAlign: 'center',
  },
});
