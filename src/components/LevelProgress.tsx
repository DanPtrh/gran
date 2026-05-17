import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Text';
import { colors } from '../theme/colors';

interface Props {
  current: number;
  needed: number;
  label?: string;
}

export function LevelProgress({ current, needed, label }: Props) {
  const segments = Array.from({ length: needed }, (_, i) => i < current);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {segments.map((filled, i) => (
          <Segment key={i} filled={filled} delay={i * 80} />
        ))}
      </View>
      {label && (
        <Text variant="monoSm" style={styles.label}>{label}</Text>
      )}
    </View>
  );
}

function Segment({ filled, delay }: { filled: boolean; delay: number }) {
  const fill = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    fill.value = withDelay(
      delay,
      withTiming(filled ? 1 : 0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [filled, delay, fill]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: fill.value > 0.5 ? colors.accent : 'transparent',
    borderColor: fill.value > 0.5 ? colors.accent : colors.borderStrong,
    opacity: 0.4 + fill.value * 0.6,
  }));

  return <Animated.View style={[styles.segment, style]} />;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    width: 28,
    height: 4,
    borderRadius: 1,
    borderWidth: 1,
  },
  label: {
    color: colors.textDim,
    letterSpacing: 1,
  },
});
