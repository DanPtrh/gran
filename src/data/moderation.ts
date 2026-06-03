// Базовый клиентский фильтр текста — требование маркетов (RuStore/Google Play)
// на user-generated content. Цель — отсечь очевидный мат, спам и контактные
// данные при сохранении. Это не криптостойкая защита, а demonstrate-able
// модерация на стороне приложения; финальная фильтрация будет на бэке после
// подключения отправки (см. memory/project_feedback_pipeline.md).

export type ModerationReason = 'profanity' | 'contact';

export interface ModerationResult {
  ok: boolean;
  reason?: ModerationReason;
  message?: string;
}

// Корни русского мата после нормализации (lowercase + leet→кириллица).
// Подобраны консервативно — без неоднозначных слов вроде «сука», «хер»,
// которые часто встречаются в обычной речи.
const PROFANITY_STEMS = [
  'хуй', 'хуя', 'хуе', 'хую', 'хуи', 'хуё',
  'пизд', 'пезд',
  'ебат', 'ебал', 'ебан', 'ебуч', 'ебло', 'ёбан', 'ёбн',
  'бляд', 'блят',
  'муда',
  'пидор', 'пидар',
  'гондон',
  'долбоеб', 'долбоёб',
];

// Латинские буквы, визуально похожие на кириллические.
const LATIN_TO_CYR: Record<string, string> = {
  a: 'а', b: 'б', c: 'с', e: 'е', h: 'н', k: 'к', m: 'м',
  o: 'о', p: 'р', t: 'т', u: 'у', x: 'х', y: 'у', z: 'з',
};

// Цифровой leet: 0→о, 3→е и т.д.
const DIGIT_TO_CYR: Record<string, string> = {
  '0': 'о', '1': 'и', '3': 'е', '4': 'ч', '6': 'б', '7': 'т', '9': 'я',
  '@': 'а', '$': 'с',
};

function normalize(text: string): string {
  let out = '';
  for (const ch of text.toLowerCase()) {
    if (LATIN_TO_CYR[ch]) out += LATIN_TO_CYR[ch];
    else if (DIGIT_TO_CYR[ch]) out += DIGIT_TO_CYR[ch];
    else out += ch;
  }
  // Сжимаем разделители внутри слов («х*у*й» → «хуй»): оставляем только
  // кириллицу. Это превращает текст в одну длинную «строку для поиска корней».
  return out.replace(/[^а-яё]/g, '');
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = normalize(text);
  if (!normalized) return false;
  return PROFANITY_STEMS.some((stem) => normalized.includes(stem));
}

// URL / email / телефон / @telegram-handle. Цель — отсечь скрытую рекламу
// и попытки оставить контактные данные через личный журнал.
const URL_PATTERN = /(https?:\/\/|www\.|t\.me\/|telegram\.me\/|vk\.com\/|instagram\.com\/)/i;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w-]{2,}/;
const DOMAIN_PATTERN = /\b[a-z0-9-]{2,}\.(ru|com|net|org|io|app|me|tg|tv)\b/i;
const PHONE_PATTERN = /(?:\+?\d[\s\-()]?){9,}\d/;
const HANDLE_PATTERN = /(^|\s)@[a-zA-Z0-9_]{4,}/;

export function containsContactInfo(text: string): boolean {
  if (!text) return false;
  return (
    URL_PATTERN.test(text) ||
    EMAIL_PATTERN.test(text) ||
    DOMAIN_PATTERN.test(text) ||
    PHONE_PATTERN.test(text) ||
    HANDLE_PATTERN.test(text)
  );
}

const MESSAGES: Record<ModerationReason, string> = {
  profanity:
    'В тексте есть нецензурные слова — это требование маркетов (RuStore/Google Play). Перефразируй и попробуй снова.',
  contact:
    'Ссылки, email, телефоны и @-имена нельзя сохранять в текстовых полях. Опиши мысль словами, без контактов.',
};

export function moderate(text: string): ModerationResult {
  if (!text || !text.trim()) return { ok: true };
  if (containsProfanity(text)) {
    return { ok: false, reason: 'profanity', message: MESSAGES.profanity };
  }
  if (containsContactInfo(text)) {
    return { ok: false, reason: 'contact', message: MESSAGES.contact };
  }
  return { ok: true };
}
