import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Text';
import { colors } from '../theme/colors';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const STONE = 14;
const STONE_ACTIVE = 18;
const CELL_WIDTH = 32; // вмещает «III»
const LINE_Y = STONE_ACTIVE / 2 - 0.5;

interface Props {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  levelProgressFrac: number; // 0..1 — заполнение текущего сегмента
  pathCompleted?: boolean;
  hint?: string; // подпись под рядом, напр. «1 из 3 · до уровня IV»
}

export function PathStones({
  currentLevel,
  levelProgressFrac,
  pathCompleted = false,
  hint,
}: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.45,
    transform: [{ scale: 0.7 + pulse.value * 0.3 }],
  }));

  // 4 сегмента между 5 камнями. Целые предыдущие уровни + дробь текущего.
  const doneSegments = pathCompleted
    ? 4
    : Math.min(4, currentLevel - 1 + (currentLevel < 5 ? levelProgressFrac : 0));
  const doneFraction = doneSegments / 4;

  return (
    <View style={styles.wrap}>
      <View style={styles.lineWrap}>
        <View style={styles.lineTrack}>
          <View style={styles.bgLine} />
          <View style={[styles.fgLine, { width: `${doneFraction * 100}%` }]} />
        </View>

        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((lvl) => {
            const done = pathCompleted || lvl < currentLevel;
            const current = !pathCompleted && lvl === currentLevel;

            return (
              <View key={lvl} style={styles.cell}>
                <View style={styles.stoneSlot}>
                  <View
                    style={[
                      styles.stone,
                      done && styles.stoneDone,
                      current && styles.stoneCurrent,
                    ]}
                  >
                    {current && (
                      <Animated.View style={[styles.stoneInnerPulse, pulseStyle]} />
                    )}
                  </View>
                </View>
                <Text
                  variant="monoSm"
                  numberOfLines={1}
                  style={[
                    styles.label,
                    done && styles.labelDone,
                    current && styles.labelCurrent,
                  ]}
                >
                  {ROMAN[lvl - 1]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {hint && (
        <Text variant="monoSm" style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  lineWrap: {
    width: '100%',
    position: 'relative',
  },
  lineTrack: {
    position: 'absolute',
    top: LINE_Y,
    left: CELL_WIDTH / 2,
    right: CELL_WIDTH / 2,
    height: 1,
  },
  bgLine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.border,
  },
  fgLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.accent,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cell: {
    alignItems: 'center',
    width: CELL_WIDTH,
    gap: 10,
  },
  stoneSlot: {
    width: STONE_ACTIVE,
    height: STONE_ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stone: {
    width: STONE,
    height: STONE,
    borderRadius: STONE / 2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  stoneDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stoneCurrent: {
    width: STONE_ACTIVE,
    height: STONE_ACTIVE,
    borderRadius: STONE_ACTIVE / 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stoneInnerPulse: {
    width: STONE_ACTIVE - 6,
    height: STONE_ACTIVE - 6,
    borderRadius: (STONE_ACTIVE - 6) / 2,
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.textFaint,
  },
  labelDone: {
    color: colors.textDim,
  },
  labelCurrent: {
    color: colors.accent,
  },
  hint: {
    color: colors.textDim,
    letterSpacing: 1,
  },
});
