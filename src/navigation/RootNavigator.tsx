import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { ReflectionScreen } from '../screens/ReflectionScreen';
import { AvatarMessageScreen } from '../screens/AvatarMessageScreen';
import { LevelUpScreen } from '../screens/LevelUpScreen';
import { PathCompletedScreen } from '../screens/PathCompletedScreen';
import { JournalEntryScreen } from '../screens/JournalEntryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { TabNavigator } from './TabNavigator';
import { colors } from '../theme/colors';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

interface Props {
  initialRoute: keyof RootStackParamList;
}

export function RootNavigator({ initialRoute }: Props) {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="Reflection" component={ReflectionScreen} />
        <Stack.Screen
          name="AvatarMessage"
          component={AvatarMessageScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="LevelUp"
          component={LevelUpScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="PathCompleted"
          component={PathCompletedScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
