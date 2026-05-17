import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { ProgressOrb } from '../components/ProgressOrb';
import { colors } from '../theme/colors';
import { levelTransitionMessage } from '../data/levelTransitions';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function LevelUpScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'LevelUp'>>();
  const { newLevel, avatarMessage } = route.params;
  const transition = levelTransitionMessage(newLevel);

  function next() {
    if (avatarMessage) {
      navigation.replace('AvatarMessage', { message: avatarMessage, level: newLevel });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.spacer} />

      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(1000)}>
          <ProgressOrb level={newLevel} progress={0} size={140} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(1400)} style={styles.textBlock}>
          <Text variant="label" style={styles.label}>уровень {ROMAN[newLevel]} достигнут</Text>
          <Text variant="displayLg" style={styles.message}>
            {transition}
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(2400).duration(800)} style={styles.cta}>
        <Button label="Дальше" variant="ghost" onPress={next} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  spacer: {
    height: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  textBlock: {
    alignItems: 'center',
    gap: 18,
  },
  label: {
    color: colors.accent,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 36,
  },
  cta: {
    marginBottom: 16,
  },
});
