import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Home, User } from 'lucide-react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Text } from '../components/Text';
import { colors } from '../theme/colors';

export type TabParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TABS = [
  { name: 'Dashboard' as const, label: 'сегодня', Icon: Home },
  { name: 'Profile' as const, label: 'журнал', Icon: User },
];

function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        const { Icon } = tab;
        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!isFocused) navigation.navigate(tab.name);
            }}
            style={styles.tab}
          >
            <Icon size={18} color={isFocused ? colors.accent : colors.textDim} />
            <Text
              variant="monoSm"
              style={[styles.label, isFocused && styles.labelActive]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  label: {
    color: colors.textDim,
  },
  labelActive: {
    color: colors.accent,
  },
});
