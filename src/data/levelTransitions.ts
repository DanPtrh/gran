const TRANSITIONS: Record<number, string> = {
  2: 'первый барьер позади',
  3: 'ты больше не сбегаешь',
  4: 'глубина перестала пугать',
  5: 'ты идёшь, не зная исхода',
};

export function levelTransitionMessage(newLevel: number): string {
  return TRANSITIONS[newLevel] ?? '';
}

export const PATH_COMPLETED_MESSAGE = 'грань огранена · это уже ты';
