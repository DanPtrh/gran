import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Keyboard, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts, sizes } from '../theme/typography';
import { moderate } from '../data/moderation';
import { loadAvatar } from '../storage/avatar';
import { RootStackParamList } from '../navigation/types';
import appJson from '../../app.json';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MIN_LEN = 10;
const MAX_LEN = 1000;
const FEEDBACK_API_URL = 'https://gran-api.vercel.app/api/feedback';
const APP_VERSION = appJson.expo.version;

export function FeedbackScreen() {
  const navigation = useNavigation<Nav>();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [avatarName, setAvatarName] = useState<string | undefined>();

  useEffect(() => {
    loadAvatar().then((a) => setAvatarName(a?.name));
  }, []);

  const trimmed = message.trim();
  const check = moderate(message);
  const canSend = trimmed.length >= MIN_LEN && check.ok && !sending;

  async function send() {
    if (sending || trimmed.length < MIN_LEN) return;
    if (!check.ok) {
      Alert.alert('Так не получится', check.message ?? 'Текст не прошёл проверку.');
      return;
    }
    Keyboard.dismiss();
    setSending(true);

    try {
      const res = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          appVersion: APP_VERSION,
          platform: Platform.OS,
          avatarName,
        }),
      });

      if (res.status === 429) {
        Alert.alert('Слишком часто', 'Сделай небольшую паузу и попробуй ещё раз через минуту.');
        return;
      }
      if (!res.ok) {
        Alert.alert(
          'Не удалось отправить',
          'Сервер вернул ошибку. Попробуй позже или напиши на app.gransup@gmail.com.',
        );
        return;
      }

      Alert.alert(
        'Спасибо',
        'Сообщение отправлено. Автор читает каждое — отвечу, если будет что добавить.',
        [{ text: 'Хорошо', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(
        'Нет связи',
        'Проверь интернет и попробуй ещё раз. Если не получается — напиши на app.gransup@gmail.com.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen scroll>
      <Header onBack={() => navigation.goBack()} title="обратная связь" />

      <Animated.View entering={FadeIn.duration(400)} style={styles.intro}>
        <Text variant="displayLg" style={styles.title}>что хочешь сказать?</Text>
        <Text variant="bodyDim" style={styles.subtitle}>
          Баги, неточности в заданиях, мысли про продукт. Пишу в одиночку — каждое сообщение читается.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.field}>
        <TextInput
          value={message}
          onChangeText={(v) => setMessage(v.slice(0, MAX_LEN))}
          multiline
          placeholder="опиши, что заметил или хочешь предложить"
          placeholderTextColor={colors.textFaint}
          style={[styles.input, !check.ok && styles.inputInvalid]}
          textAlignVertical="top"
        />
        <View style={styles.counterRow}>
          {!check.ok ? (
            <Text variant="monoSm" style={styles.errorHint}>{check.message}</Text>
          ) : (
            <Text variant="monoSm" style={styles.counter}>
              {trimmed.length < MIN_LEN
                ? `минимум ${MIN_LEN} символов`
                : `${message.length} / ${MAX_LEN}`}
            </Text>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.cta}>
        <Button
          label={sending ? 'Отправляется…' : 'Отправить'}
          onPress={send}
          disabled={!canSend}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    lineHeight: 22,
  },
  field: {
    marginBottom: 24,
  },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    padding: 16,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: sizes.base,
    lineHeight: sizes.base * 1.5,
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  counterRow: {
    marginTop: 8,
  },
  counter: {
    color: colors.textDim,
    textAlign: 'right',
  },
  errorHint: {
    color: colors.danger,
    textTransform: 'none',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  cta: {
    marginTop: 8,
    marginBottom: 24,
  },
});
