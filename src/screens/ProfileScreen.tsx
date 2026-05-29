import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Settings as SettingsIcon } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { ProgressOrb } from '../components/ProgressOrb';
import { PathStones } from '../components/PathStones';
import { Logo } from '../components/Logo';
import { colors } from '../theme/colors';
import { Avatar, Completion, ProgressMap, Skill, SkillId, SkillProgress } from '../types';
import {
  loadAvatar,
  loadCompletions,
  loadProgress,
  setActiveSkill,
} from '../storage/avatar';
import { loadPreferences, setConfirmSkillSwitch } from '../storage/preferences';
import { skills, getSkill } from '../data/skills';
import { getTaskById } from '../data/tasks';
import { LEVEL_RULES, computeStreak } from '../data/progression';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [completions, setCompletions] = useState<Completion[]>([]);

  const refresh = useCallback(async () => {
    setAvatar(await loadAvatar());
    setProgressMap(await loadProgress());
    setCompletions((await loadCompletions()).reverse());
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  async function doSwitch(skillId: SkillId) {
    const next = await setActiveSkill(skillId);
    setAvatar(next);
    setProgressMap(await loadProgress());
    navigation.navigate('Main', { screen: 'Dashboard' });
  }

  async function activate(skillId: SkillId) {
    if (!avatar || skillId === avatar.activeSkillId) return;
    const prefs = await loadPreferences();
    if (!prefs.confirmSkillSwitch) {
      await doSwitch(skillId);
      return;
    }
    const skill = getSkill(skillId);
    const hasProgress = !!progressMap[skillId];
    Alert.alert(
      hasProgress ? `Вернуться к навыку «${skill?.name}»?` : `Начать навык «${skill?.name}»?`,
      hasProgress
        ? 'Прогресс по текущему навыку сохранится. Ты сможешь вернуться к нему в любой момент.'
        : 'Текущий навык сохранится. Ты сможешь вернуться к нему в любой момент.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Не спрашивать снова',
          onPress: async () => {
            await setConfirmSkillSwitch(false);
            await doSwitch(skillId);
          },
        },
        {
          text: hasProgress ? 'Вернуться' : 'Начать',
          onPress: () => doSwitch(skillId),
        },
      ],
    );
  }

  if (!avatar) return <Screen><View /></Screen>;

  const activeProgress = progressMap[avatar.activeSkillId];
  const activeLevel = activeProgress?.currentLevel ?? 1;
  const rule = LEVEL_RULES[activeLevel];
  const progressFrac = activeProgress
    ? Math.min(1, activeProgress.levelProgress / rule.needed)
    : 0;

  return (
    <Screen scroll edges={['top']}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          hitSlop={16}
          style={styles.settingsBtn}
        >
          <SettingsIcon size={20} color={colors.textDim} />
        </Pressable>
        <View style={styles.brandMark}>
          <Logo size={20} showFacets={false} />
        </View>
        <Text variant="displayXl" style={styles.name}>{avatar.name}</Text>
        <Text variant="bodyDim" style={styles.subtitle}>
          путь начат {fmtDate(avatar.createdAt)}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(150).duration(700)} style={styles.orbWrap}>
        <ProgressOrb level={activeLevel} progress={progressFrac} size={160} />
        <Text variant="monoSm" style={styles.activeSkill}>
          {getSkill(avatar.activeSkillId)?.name}
        </Text>
        {activeProgress && (
          <PathStones
            currentLevel={activeProgress.currentLevel}
            levelProgressFrac={progressFrac}
            pathCompleted={!!activeProgress.pathCompletedAt}
            hint={
              activeProgress.pathCompletedAt
                ? 'путь пройден'
                : activeLevel < 5
                  ? `${activeProgress.levelProgress} из ${rule.needed} · до уровня ${ROMAN[activeLevel + 1]}`
                  : `${activeProgress.levelProgress} из ${rule.needed} · последний уровень`
            }
          />
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>ветки развития</Text>
        {skills.map((s, i) => (
          <SkillBranch
            key={s.id}
            skill={s}
            isActive={s.id === avatar.activeSkillId}
            progress={progressMap[s.id]}
            completions={completions}
            onPress={() => activate(s.id)}
            delay={300 + i * 80}
          />
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(550).duration(600)} style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>журнал</Text>
        {completions.length === 0 ? (
          <Text variant="bodyDim" style={styles.empty}>
            Пока тут пусто. Первая запись появится после рефлексии.
          </Text>
        ) : (
          completions.map((c, i) => {
            const t = getTaskById(c.taskId);
            const entrySkill = t ? getSkill(t.skillId) : null;
            return (
              <Animated.View
                key={c.id}
                entering={FadeInDown.delay(600 + i * 50).duration(500)}
              >
                <Pressable
                  onPress={() => navigation.navigate('JournalEntry', { completionId: c.id })}
                  style={styles.entry}
                >
                  <View style={styles.entryHeader}>
                    <Text variant="mono" style={styles.entryDate}>{fmtDate(c.completedAt)}</Text>
                    <Text variant="mono" style={styles.entryDiscomfort}>
                      дискомфорт · {c.discomfortScore}
                    </Text>
                  </View>
                  {entrySkill && (
                    <View style={styles.entrySkillRow}>
                      <Text style={styles.entrySkillIcon}>{entrySkill.icon}</Text>
                      <Text variant="mono" style={styles.entrySkillName}>
                        {entrySkill.name}{t ? ` · уровень ${ROMAN[t.level]}` : ''}
                      </Text>
                    </View>
                  )}
                  <Text variant="display" style={styles.entryTitle}>{t?.title ?? 'Задание'}</Text>
                  {!!c.reflectionHard && (
                    <Text variant="bodyDim" style={styles.entryNote} numberOfLines={2}>
                      <Text variant="monoSm">сложное · </Text>{c.reflectionHard}
                    </Text>
                  )}
                  {!!c.reflectionSurprise && (
                    <Text variant="bodyDim" style={styles.entryNote} numberOfLines={2}>
                      <Text variant="monoSm">удивило · </Text>{c.reflectionSurprise}
                    </Text>
                  )}
                  <Text variant="monoSm" style={styles.entryOpen}>открыть →</Text>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </Animated.View>

    </Screen>
  );
}

function SkillBranch({
  skill,
  isActive,
  progress,
  completions,
  onPress,
  delay,
}: {
  skill: Skill;
  isActive: boolean;
  progress: SkillProgress | undefined;
  completions: Completion[];
  onPress: () => void;
  delay: number;
}) {
  const streak = progress ? computeStreak(skill.id, completions) : 0;
  const doneCount = completions.filter(
    (c) => getTaskById(c.taskId)?.skillId === skill.id,
  ).length;

  let hintText: string;
  if (isActive && progress) {
    hintText = `активная · уровень ${ROMAN[progress.currentLevel]} · стрик ${streak}`;
  } else if (progress) {
    hintText = `уровень ${ROMAN[progress.currentLevel]} · ${doneCount} ${plural(doneCount, ['задание', 'задания', 'заданий'])}`;
  } else {
    hintText = 'не начат · тапни, чтобы запустить';
  }

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <Pressable onPress={onPress} disabled={isActive}>
        <View
          style={[
            styles.branch,
            isActive && styles.branchActive,
            !progress && !isActive && styles.branchEmpty,
          ]}
        >
          <Text style={[styles.branchIcon, isActive && styles.branchIconActive]}>{skill.icon}</Text>
          <View style={styles.branchBody}>
            <Text variant="display" style={isActive ? styles.branchNameActive : styles.branchName}>
              {skill.name}
            </Text>
            <Text variant="monoSm" style={styles.branchHint}>{hintText}</Text>
          </View>
          <View style={styles.branchSide}>
            <Text
              variant="mono"
              style={[
                styles.branchLevel,
                isActive && styles.branchLevelActive,
                !progress && styles.branchLevelEmpty,
              ]}
            >
              {progress ? ROMAN[progress.currentLevel] : '—'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return forms[1];
  return forms[2];
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  settingsBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  brandMark: {
    marginBottom: 16,
    opacity: 0.7,
  },
  name: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
  },
  orbWrap: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 16,
  },
  activeSkill: {
    color: colors.accent,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  branch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 14,
    backgroundColor: colors.backgroundElevated,
  },
  branchActive: {
    borderColor: colors.accent,
  },
  branchEmpty: {
    backgroundColor: 'transparent',
  },
  branchIcon: {
    fontSize: 22,
    color: colors.textDim,
    fontFamily: 'Fraunces_500Medium',
    width: 26,
    textAlign: 'center',
  },
  branchIconActive: {
    color: colors.accent,
  },
  branchBody: {
    flex: 1,
  },
  branchName: {
    color: colors.text,
  },
  branchNameActive: {
    color: colors.text,
  },
  branchHint: {
    marginTop: 4,
  },
  branchSide: {
    minWidth: 28,
    alignItems: 'flex-end',
  },
  branchLevel: {
    fontSize: 18,
    color: colors.textDim,
    letterSpacing: 1,
  },
  branchLevelActive: {
    color: colors.accent,
  },
  branchLevelEmpty: {
    color: colors.textFaint,
  },
  empty: {
    marginTop: 12,
  },
  entry: {
    marginTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    color: colors.textDim,
  },
  entryDiscomfort: {
    color: colors.accent,
  },
  entrySkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  entrySkillIcon: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: 'Fraunces_500Medium',
  },
  entrySkillName: {
    fontSize: 12,
    color: colors.text,
    letterSpacing: 0.5,
  },
  entryTitle: {
    marginBottom: 10,
  },
  entryNote: {
    marginTop: 6,
  },
  entryOpen: {
    marginTop: 12,
    color: colors.accent,
  },
});
