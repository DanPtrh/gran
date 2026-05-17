import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, sizes } from '../theme/typography';

type Variant = 'display' | 'displayLg' | 'displayXl' | 'body' | 'bodyDim' | 'mono' | 'monoSm' | 'label';

interface Props extends TextProps {
  variant?: Variant;
}

export function Text({ variant = 'body', style, ...rest }: Props) {
  return <RNText {...rest} style={[styles[variant], style]} />;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: fonts.displayMedium,
    fontSize: sizes.lg,
    color: colors.text,
    lineHeight: sizes.lg * 1.3,
  },
  displayLg: {
    fontFamily: fonts.displaySemibold,
    fontSize: sizes.xl,
    color: colors.text,
    lineHeight: sizes.xl * 1.2,
  },
  displayXl: {
    fontFamily: fonts.displaySemibold,
    fontSize: sizes.xxl,
    color: colors.text,
    lineHeight: sizes.xxl * 1.15,
  },
  body: {
    fontFamily: fonts.display,
    fontSize: sizes.base,
    color: colors.text,
    lineHeight: sizes.base * 1.5,
  },
  bodyDim: {
    fontFamily: fonts.display,
    fontSize: sizes.base,
    color: colors.textDim,
    lineHeight: sizes.base * 1.5,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: sizes.sm,
    color: colors.text,
    letterSpacing: 0.5,
  },
  monoSm: {
    fontFamily: fonts.mono,
    fontSize: sizes.xs,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: sizes.xs,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
