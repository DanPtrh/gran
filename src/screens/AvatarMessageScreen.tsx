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
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AvatarMessageScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'AvatarMessage'>>();
  const { message, level } = route.params;

  function next() {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  return (
    <Screen contentStyle={styles.content}>
      <Animated.View entering={FadeIn.duration(900)} style={styles.orbWrap}>
        <ProgressOrb level={level} progress={1} size={110} />
      </Animated.View>

      <View style={styles.center}>
        <Animated.View entering={FadeInDown.delay(700).duration(1600)}>
          <Text variant="displayLg" style={styles.message}>
            {message}
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(2200).duration(800)} style={styles.cta}>
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
  orbWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  label: {
    color: colors.accent,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 36,
    fontStyle: 'italic',
  },
  cta: {
    marginBottom: 16,
  },
});
