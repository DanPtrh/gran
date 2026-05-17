import { Skill } from '../types';

export const skills: Skill[] = [
  {
    id: 'sociability',
    name: 'Общительность',
    icon: '◐',
    description: 'Контакт с людьми перестанет быть барьером',
    promise: 'Через 21 день ты будешь начинать разговоры там, где раньше молчал.',
    available: true,
  },
  {
    id: 'focus',
    name: 'Фокус',
    icon: '◉',
    description: 'Удерживать внимание на главном',
    promise: 'Через 21 день ты сможешь работать без перескакивания на отвлечения.',
    available: true,
  },
  {
    id: 'discipline',
    name: 'Дисциплина',
    icon: '◈',
    description: 'Делать обещанное себе',
    promise: 'Через 21 день обещание себе будет иметь вес.',
    available: true,
  },
];

export function getSkill(id: string) {
  return skills.find((s) => s.id === id);
}
