import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface Props {
  level: number;
  progress: number; // 0..1
  size?: number;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function ProgressOrb({ level, progress, size = 140 }: Props) {
  const breathe = useSharedValue(0);
  const spin = useSharedValue(0);
  const spinFast = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    spin.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.linear }),
      -1,
      false,
    );
    spinFast.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [breathe, spin, spinFast]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.04 }],
    opacity: 0.4 + breathe.value * 0.35,
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.02 }],
  }));

  const outerRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const orbitRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinFast.value * 360}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + breathe.value * 0.18,
    transform: [{ scale: 0.95 + breathe.value * 0.08 }],
  }));

  const ringSize = size;
  const coreSize = size * 0.55 + progress * size * 0.3;
  const outerRingSize = size * 1.22;
  const orbitSize = size * 1.4;

  const showGlow = level >= 5;
  const showOuterRing = level >= 2;
  const showOrbit = level >= 4;
  const extraGlowOpacity = Math.min(1, (level - 1) * 0.12);

  return (
    <View style={[styles.wrap, { width: orbitSize, height: orbitSize }]}>
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            {
              width: outerRingSize * 1.1,
              height: outerRingSize * 1.1,
              borderRadius: outerRingSize,
            },
          ]}
        />
      )}

      {showOuterRing && (
        <Animated.View
          style={[
            styles.outerRing,
            outerRotateStyle,
            {
              width: outerRingSize,
              height: outerRingSize,
              borderRadius: outerRingSize / 2,
              opacity: 0.25 + extraGlowOpacity,
            },
          ]}
        >
          <View style={[styles.outerRingTick, { top: -2 }]} />
          <View style={[styles.outerRingTick, { bottom: -2 }]} />
        </Animated.View>
      )}

      {showOrbit && (
        <Animated.View
          style={[
            styles.orbit,
            orbitRotateStyle,
            { width: orbitSize, height: orbitSize, borderRadius: orbitSize / 2 },
          ]}
        >
          <View style={[styles.particle, { top: -3, left: orbitSize / 2 - 3 }]} />
          <View style={[styles.particle, { bottom: -3, left: orbitSize / 2 - 3, opacity: 0.55 }]} />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
        ]}
      />

      <Animated.View
        style={[
          styles.core,
          coreStyle,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
            opacity: 0.14 + extraGlowOpacity * 0.5,
          },
        ]}
      />

      <View style={styles.levelText}>
        <Animated.Text style={[styles.levelNumber, { fontSize: size * 0.32 }]}>
          {ROMAN[level] ?? ''}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.accent,
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  outerRingTick: {
    position: 'absolute',
    left: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginLeft: -2,
  },
  orbit: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  core: {
    position: 'absolute',
    backgroundColor: colors.accent,
  },
  levelText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontFamily: fonts.displaySemibold,
    color: colors.text,
    letterSpacing: 2,
  },
});
