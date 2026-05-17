import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { colors } from '../theme/colors';
import { PATH_COMPLETED_MESSAGE } from '../data/levelTransitions';
import { getSkill } from '../data/skills';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PathCompletedScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'PathCompleted'>>();
  const { skillId } = route.params;
  const skill = getSkill(skillId);

  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [breathe]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.04 }],
    opacity: 0.75 + breathe.value * 0.25,
  }));

  function next() {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.spacer} />

      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(1600)} style={breatheStyle}>
          <Logo size={160} showFacets={true} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1400).duration(1800)} style={styles.textBlock}>
          <Text variant="label" style={styles.label}>путь пройден</Text>
          <Text variant="displayLg" style={styles.message}>
            {PATH_COMPLETED_MESSAGE}
          </Text>
          {skill && (
            <Text variant="bodyDim" style={styles.skillNote}>
              {skill.name} · пять уровней
            </Text>
          )}
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(3500).duration(1000)} style={styles.cta}>
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
    gap: 56,
  },
  textBlock: {
    alignItems: 'center',
    gap: 16,
  },
  label: {
    color: colors.accent,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 36,
    maxWidth: 320,
  },
  skillNote: {
    marginTop: 12,
    fontSize: 13,
  },
  cta: {
    marginBottom: 16,
  },
});
