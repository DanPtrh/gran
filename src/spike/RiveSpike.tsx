// СПАЙК Rive — временный экран для проверки рендера и перформанса Rive
// на новой архитектуре (Fabric) и на бюджетном Android. НЕ для прода.
// Включается флагом RIVE_SPIKE в App.tsx. Удалить вместе с папкой src/spike
// после того, как риск снят.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Rive, { Fit, Alignment } from 'rive-react-native';
import { colors } from '../theme/colors';

// Публичный демо-ассет Rive (грузим по сети, чтобы не настраивать бандлинг
// .riv в спайке — это следующий шаг, если рендер заработает).
const RIVE_URL = 'https://cdn.rive.app/animations/vehicles.riv';

export function RiveSpike() {
  const [status, setStatus] = useState('загрузка Rive...');

  useEffect(() => {
    // Native splash держится из App.tsx — гасим вручную, раз мы в обход
    // обычного флоу готовности.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RIVE SPIKE</Text>
      <Text style={styles.subtitle}>{status}</Text>

      <View style={styles.stage}>
        <Rive
          url={RIVE_URL}
          autoplay
          fit={Fit.Contain}
          alignment={Alignment.Center}
          style={styles.rive}
          onPlay={() => setStatus('играет — рендер OK')}
          onError={(e: unknown) => setStatus('ОШИБКА: ' + String(e))}
        />
      </View>

      <Text style={styles.hint}>
        Если анимация машинки дышит/едет и не дёргается — Rive живёт на новой
        архитектуре. Покрути экран, оцени плавность.
      </Text>

      <Pressable
        style={styles.btn}
        onPress={() => setStatus('тап работает · ' + new Date().toLocaleTimeString())}
      >
        <Text style={styles.btnText}>пинг</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.accent,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.text,
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
  stage: {
    width: '100%',
    height: 320,
    marginVertical: 24,
  },
  rive: {
    flex: 1,
  },
  hint: {
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 18,
  },
  btn: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 2,
  },
  btnText: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 2,
  },
});
