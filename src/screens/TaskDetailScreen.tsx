import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TaskDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const { task } = route.params;

  return (
    <Screen scroll>
      <Header onBack={() => navigation.goBack()} title={`уровень ${task.level}`} />
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Text variant="displayLg" style={styles.title}>{task.title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(600)}>
        <Text variant="body" style={styles.desc}>{task.description}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
        <Text variant="monoSm" style={styles.sectionTitle}>как это сделать</Text>
        {task.tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text variant="mono" style={styles.tipBullet}>{String(i + 1).padStart(2, '0')}</Text>
            <Text variant="body" style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Animated.View>

      {task.example && (
        <Animated.View entering={FadeInDown.delay(450).duration(600)} style={styles.example}>
          <Text variant="monoSm" style={styles.sectionTitle}>пример</Text>
          <Text variant="bodyDim" style={styles.exampleText}>{task.example}</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.cta}>
        <Button
          label="Я сделал это"
          onPress={() => navigation.navigate('Reflection', { task })}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    marginTop: 10,
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
  cta: {
    marginTop: 12,
  },
});
