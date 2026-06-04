// Ограничивает набор нативных архитектур, попадающих в сборку.
// Выкидываем эмуляторные x86/x86_64 — ни одно реальное Android-устройство их не
// использует. Оставляем armeabi-v7a (старые 32-битные телефоны) и arm64-v8a
// (все современные). Это примерно вдвое уменьшает универсальный APK без риска
// для запуска на физических устройствах.
//
// Влияет только на buildType "apk" (preview). Для AAB стор и так нарезает per-ABI,
// но свойство безвредно и для app-bundle.
const { withGradleProperties } = require('expo/config-plugins');

const ARCHITECTURES = 'armeabi-v7a,arm64-v8a';

module.exports = function withAbiFilter(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'reactNativeArchitectures')
    );
    cfg.modResults.push({
      type: 'property',
      key: 'reactNativeArchitectures',
      value: ARCHITECTURES,
    });
    return cfg;
  });
};
