import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { RootNavigator } from './src/navigation/RootNavigator';
import { loadAvatar } from './src/storage/avatar';
import { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/colors';

// Держим native splash до полной готовности (шрифты + загрузка аватара).
// На слабых устройствах это убирает «мерцание» между шрифтовым boot-view
// и первым реальным экраном.
SplashScreen.preventAutoHideAsync().catch(() => {});

type InitialRoute = keyof RootStackParamList;

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    loadAvatar()
      .then((a) => setInitialRoute(a ? 'Main' : 'Onboarding'))
      .catch(() => setInitialRoute('Onboarding'));
  }, []);

  const ready = fontsLoaded && initialRoute !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready || !initialRoute) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <RootNavigator initialRoute={initialRoute} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
