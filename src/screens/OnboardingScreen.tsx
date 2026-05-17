import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts, sizes } from '../theme/typography';
import { skills } from '../data/skills';
import { Skill, SkillId, Avatar } from '../types';
import { getOrCreateProgress, saveAvatar } from '../storage/avatar';
import { RootStackParamList } from '../navigation/types';
import { Logo } from '../components/Logo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [skillId, setSkillId] = useState<SkillId | null>(null);

  const canStart = name.trim().length >= 2 && skillId !== null;

  async function start() {
    if (!canStart || !skillId) return;
    const avatar: Avatar = {
      name: name.trim(),
      activeSkillId: skillId,
      createdAt: new Date().toISOString(),
    };
    await saveAvatar(avatar);
    await getOrCreateProgress(skillId);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.intro}>
        <View style={styles.brandRow}>
          <Logo size={28} showFacets={false} />
          <Text variant="monoSm" style={styles.brandName}>Г Р А Н Ь</Text>
        </View>
        <Text variant="label" style={styles.introLabel}>Начало пути</Text>
        <Text variant="displayXl" style={styles.title}>
          Создай того,{'\n'}кем ты хочешь быть
        </Text>
        <Text variant="bodyDim" style={styles.subtitle}>
          Аватар — это не персонаж. Это версия тебя, в которую ты вырастаешь через действие.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.fieldLabel}>имя аватара</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="как его называть"
          placeholderTextColor={colors.textFaint}
          maxLength={24}
          style={styles.input}
          autoCorrect={false}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.fieldLabel}>первый навык</Text>
        {skills.map((s, i) => (
          <SkillOption
            key={s.id}
            skill={s}
            selected={skillId === s.id}
            onSelect={() => s.available && setSkillId(s.id)}
            delay={500 + i * 100}
          />
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900).duration(600)} style={styles.cta}>
        <Button label="Начать путь" onPress={start} disabled={!canStart} />
      </Animated.View>
    </Screen>
  );
}

function SkillOption({
  skill,
  selected,
  onSelect,
  delay,
}: {
  skill: Skill;
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <Pressable
        onPress={onSelect}
        disabled={!skill.available}
        style={[
          styles.skillCard,
          selected && styles.skillCardSelected,
          !skill.available && styles.skillCardLocked,
        ]}
      >
        <View style={styles.skillHeader}>
          <Text variant="display" style={styles.skillIcon}>{skill.icon}</Text>
          <View style={styles.skillTitleWrap}>
            <Text variant="display">{skill.name}</Text>
            {!skill.available && (
              <Text variant="monoSm" style={styles.locked}>откроется позже</Text>
            )}
          </View>
        </View>
        <Text variant="bodyDim" style={styles.skillDesc}>{skill.description}</Text>
        {selected && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.promise}>
            <Text variant="mono" style={styles.promiseText}>{skill.promise}</Text>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 32,
  },
  intro: {
    marginBottom: 48,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  brandName: {
    color: colors.text,
    letterSpacing: 4,
  },
  introLabel: {
    marginBottom: 4,
  },
  title: {
    marginTop: 16,
  },
  subtitle: {
    marginTop: 16,
    maxWidth: 320,
  },
  section: {
    marginBottom: 32,
  },
  fieldLabel: {
    marginBottom: 12,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: sizes.lg,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  skillCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 12,
    borderRadius: 2,
    backgroundColor: colors.backgroundElevated,
  },
  skillCardSelected: {
    borderColor: colors.accent,
  },
  skillCardLocked: {
    opacity: 0.4,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  skillIcon: {
    fontSize: 24,
    color: colors.accent,
  },
  skillTitleWrap: {
    flex: 1,
  },
  skillDesc: {
    marginTop: 8,
    fontSize: sizes.sm,
  },
  locked: {
    marginTop: 2,
  },
  promise: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  promiseText: {
    color: colors.accent,
    lineHeight: 20,
  },
  cta: {
    marginTop: 16,
  },
});
