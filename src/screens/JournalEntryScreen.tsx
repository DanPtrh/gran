import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { Completion } from '../types';
import { loadCompletions } from '../storage/avatar';
import { getTaskById } from '../data/tasks';
import { getSkill } from '../data/skills';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function JournalEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'JournalEntry'>>();
  const { completionId } = route.params;

  const [completion, setCompletion] = useState<Completion | null>(null);

  useEffect(() => {
    loadCompletions().then((list) => {
      setCompletion(list.find((c) => c.id === completionId) ?? null);
    });
  }, [completionId]);

  if (!completion) {
    return (
      <Screen>
        <Header onBack={() => navigation.goBack()} title="запись журнала" />
      </Screen>
    );
  }

  const task = getTaskById(completion.taskId);
  const skill = task ? getSkill(task.skillId) : null;

  return (
    <Screen scroll>
      <Header
        onBack={() => navigation.goBack()}
        title={task ? `уровень ${ROMAN[task.level]}` : 'запись журнала'}
      />

      <Animated.View entering={FadeIn.duration(500)} style={styles.meta}>
        <Text variant="mono" style={styles.metaDate}>{fmtDate(completion.completedAt)}</Text>
        {skill && (
          <Text variant="mono" style={styles.metaSkill}>{skill.name}</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(80).duration(500)} style={styles.titleWrap}>
        <Text variant="displayLg" style={styles.title}>{task?.title ?? 'Задание удалено'}</Text>
      </Animated.View>

      {task && (
        <Animated.View entering={FadeInDown.delay(150).duration(600)}>
          <Text variant="body" style={styles.desc}>{task.description}</Text>
        </Animated.View>
      )}

      {task && (
        <Animated.View entering={FadeInDown.delay(280).duration(600)} style={styles.section}>
          <Text variant="monoSm" style={styles.sectionTitle}>как это было сделать</Text>
          {task.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text variant="mono" style={styles.tipBullet}>{String(i + 1).padStart(2, '0')}</Text>
              <Text variant="body" style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {task?.example && (
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.example}>
          <Text variant="monoSm" style={styles.sectionTitle}>пример</Text>
          <Text variant="bodyDim" style={styles.exampleText}>{task.example}</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(520).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.sectionTitle}>твоя рефлексия</Text>
        <View style={styles.reflectionRow}>
          <Text variant="monoSm" style={styles.reflectionLabel}>дискомфорт</Text>
          <Text variant="mono" style={styles.reflectionValue}>{completion.discomfortScore} / 5</Text>
        </View>
        {!!completion.reflectionHard && (
          <View style={styles.reflectionBlock}>
            <Text variant="monoSm" style={styles.reflectionLabel}>что было сложным</Text>
            <Text variant="body" style={styles.reflectionText}>{completion.reflectionHard}</Text>
          </View>
        )}
        {!!completion.reflectionSurprise && (
          <View style={styles.reflectionBlock}>
            <Text variant="monoSm" style={styles.reflectionLabel}>что удивило</Text>
            <Text variant="body" style={styles.reflectionText}>{completion.reflectionSurprise}</Text>
          </View>
        )}
        {!completion.reflectionHard && !completion.reflectionSurprise && (
          <Text variant="bodyDim" style={styles.reflectionEmpty}>
            Заметки не сохранились.
          </Text>
        )}
      </Animated.View>
    </Screen>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  metaDate: {
    color: colors.textDim,
  },
  metaSkill: {
    color: colors.accent,
  },
  titleWrap: {
    marginBottom: 24,
  },
  title: {
    marginTop: 6,
  },
  desc: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 18,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 14,
  },
  tipBullet: {
    color: colors.accent,
    marginTop: 4,
  },
  tipText: {
    flex: 1,
  },
  example: {
    borderLeftWidth: 1,
    borderLeftColor: colors.accentDim,
    paddingLeft: 16,
    marginBottom: 40,
  },
  exampleText: {
    fontStyle: 'italic',
  },
  reflectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 18,
  },
  reflectionLabel: {
    color: colors.textDim,
    marginBottom: 6,
  },
  reflectionValue: {
    color: colors.accent,
  },
  reflectionBlock: {
    marginBottom: 18,
  },
  reflectionText: {
    marginTop: 4,
  },
  reflectionEmpty: {
    marginTop: 8,
  },
});
