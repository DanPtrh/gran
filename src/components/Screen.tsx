import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ReadonlyArray<Edge>;
}

export function Screen({
  children,
  scroll,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
}: Props) {
  const Container: any = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <StatusBar style="light" />
      <Container
        style={styles.container}
        contentContainerStyle={scroll ? [styles.scrollContent, contentStyle] : undefined}
      >
        {scroll ? children : <View style={[styles.inner, contentStyle]}>{children}</View>}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});
