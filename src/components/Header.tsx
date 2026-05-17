import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';

interface Props {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function Header({ title, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={16} style={styles.backBtn}>
            <ChevronLeft size={20} color={colors.text} />
            <Text variant="monoSm" style={styles.backLabel}>назад</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.center}>
        {title ? <Text variant="monoSm">{title}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    marginBottom: 8,
  },
  side: {
    minWidth: 80,
    flexDirection: 'row',
  },
  right: {
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingRight: 12,
  },
  backLabel: {
    color: colors.text,
  },
});
