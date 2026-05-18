# ГРАНЬ

Мобильное приложение для самопрограммирования через действие. Пользователь выбирает один из трёх навыков (Общительность, Фокус, Дисциплина), получает по одному заданию в день с нарастающим психологическим дискомфортом, и после выполнения проходит короткую рефлексию.

Метафора — огранка камня: каждое выполненное задание — это удар по грани, человек постепенно «огранивается».

## Статус

Pre-MVP, версия 0.1.0. Активная разработка. Первый релиз планируется в RuStore (приоритет) и Google Play. iOS вне scope MVP.

## Стек

- React Native 0.81 + Expo SDK 54 (TypeScript, новая архитектура / Fabric)
- React Navigation v7 (Native Stack + Bottom Tabs)
- Reanimated 4 + worklets
- AsyncStorage (локальное хранение, без бэкенда в MVP)
- `@expo-google-fonts/fraunces` + `@expo-google-fonts/jetbrains-mono` (локально вбандленные)
- `lucide-react-native`, `expo-haptics`, `expo-splash-screen`

## Документы

- [Политика конфиденциальности](https://danptrh.github.io/gran/privacy)
- [Условия использования](https://danptrh.github.io/gran/terms)

## Локальный запуск

```bash
npm install
npm run web        # быстрый просмотр в браузере (анимации не 1:1)
npm run android    # Android emulator (нужен Android Studio + AVD)
npm start          # QR для Expo Go на физическом устройстве
```

## Сборка для стора

Через EAS Build:

```bash
npx eas build --platform android --profile preview     # APK для теста
npx eas build --platform android --profile production  # AAB для стора
```

Конфигурация в `eas.json`. Keystore хранится в EAS managed credentials.

## Лицензия

Copyright (c) 2026 ГРАНЬ. Все права защищены.

Этот код опубликован для прозрачности и не предназначен для копирования, форкания, изменения или коммерческого использования. См. [LICENSE](./LICENSE).
