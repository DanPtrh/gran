import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { ReflectionScreen } from '../screens/ReflectionScreen';
import { AvatarMessageScreen } from '../screens/AvatarMessageScreen';
import { LevelUpScreen } from '../screens/LevelUpScreen';
import { PathCompletedScreen } from '../screens/PathCompletedScreen';
import { TabNavigator } from './TabNavigator';
import { loadAvatar } from '../storage/avatar';
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

export function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    loadAvatar().then((a) => {
      setInitialRoute(a ? 'Main' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) return null;

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
