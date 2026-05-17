import { Completion, SkillId, SkillProgress, Task } from '../types';
import { getTaskById, getTasksByLevel } from './tasks';

export const LEVEL_RULES: Record<number, { needed: number; minAvgDiscomfort: number }> = {
  1: { needed: 3, minAvgDiscomfort: 3 },
  2: { needed: 4, minAvgDiscomfort: 4 },
  3: { needed: 4, minAvgDiscomfort: 5 },
  4: { needed: 4, minAvgDiscomfort: 5 },
  5: { needed: 4, minAvgDiscomfort: 5 },
};

export const MAX_DEFERRALS = 2;

export function pickTaskForToday(
  skillId: SkillId,
  progress: SkillProgress,
  completions: Completion[],
): Task | null {
  // В dev-сборке снимаем ограничение "одно задание в сутки" — иначе нельзя
  // протестировать переходы уровней и завершение пути за разумное время.
  // В продакшен-сборке (__DEV__ === false) лимит действует.
  if (!__DEV__) {
    if (progress.deferredUntil && isToday(progress.deferredUntil)) return null;
  }

  const pool = getTasksByLevel(skillId, progress.currentLevel);
  if (pool.length === 0) return null;

  const skillCompletions = completionsOf(skillId, completions);

  if (!__DEV__) {
    const doneTodayIds = new Set(
      skillCompletions.filter((c) => isToday(c.completedAt)).map((c) => c.taskId),
    );
    if (doneTodayIds.size > 0) return null;
  }

  const onLevel = skillCompletions.filter((c) => taskLevel(c.taskId) === progress.currentLevel);
  const everDoneOnLevel = new Set(onLevel.map((c) => c.taskId));
  const freshOnLevel = pool.filter((t) => !everDoneOnLevel.has(t.id));

  if (onLevel.length === 0) {
    const v1 = pool.find((t) => t.variantOrder === 1);
    if (v1) return v1;
  }

  if (freshOnLevel.length > 0) {
    return freshOnLevel[Math.floor(Math.random() * freshOnLevel.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function shouldLevelUp(
  skillId: SkillId,
  progress: SkillProgress,
  completions: Completion[],
): boolean {
  const rule = LEVEL_RULES[progress.currentLevel];
  if (!rule) return false;
  const onLevel = completionsOf(skillId, completions).filter(
    (c) => taskLevel(c.taskId) === progress.currentLevel,
  );
  if (onLevel.length < rule.needed) return false;
  const avg = onLevel.reduce((s, c) => s + c.discomfortScore, 0) / onLevel.length;
  return avg >= rule.minAvgDiscomfort;
}

export function applyCompletion(
  skillId: SkillId,
  progress: SkillProgress,
  completions: Completion[],
): SkillProgress {
  const next: SkillProgress = { ...progress };
  next.levelProgress = completionsOf(skillId, completions).filter(
    (c) => taskLevel(c.taskId) === progress.currentLevel,
  ).length;
  if (shouldLevelUp(skillId, progress, completions)) {
    if (progress.currentLevel < 5) {
      next.currentLevel = (progress.currentLevel + 1) as SkillProgress['currentLevel'];
      next.levelProgress = 0;
    } else if (!progress.pathCompletedAt) {
      next.pathCompletedAt = new Date().toISOString();
    }
  }
  return next;
}

export function computeStreak(skillId: SkillId, completions: Completion[]): number {
  const filtered = completionsOf(skillId, completions);
  if (filtered.length === 0) return 0;
  const days = new Set(
    filtered.map((c) => {
      const d = new Date(c.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      const key2 = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      if (!days.has(key2)) return 0;
    } else {
      break;
    }
  }
  return streak;
}

function completionsOf(skillId: SkillId, completions: Completion[]): Completion[] {
  return completions.filter((c) => {
    const t = getTaskById(c.taskId);
    return t?.skillId === skillId;
  });
}

function taskLevel(taskId: string): number | undefined {
  return getTaskById(taskId)?.level;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
