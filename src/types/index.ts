export type SkillId = 'sociability' | 'focus' | 'discipline';

export interface Skill {
  id: SkillId;
  name: string;
  icon: string;
  description: string;
  promise: string;
  available: boolean;
}

export interface Task {
  id: string;
  skillId: SkillId;
  level: 1 | 2 | 3 | 4 | 5;
  variantOrder: number;
  title: string;
  description: string;
  tips: string[];
  example?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface Completion {
  id: string;
  taskId: string;
  completedAt: string;
  discomfortScore: number;
  reflectionHard: string;
  reflectionSurprise: string;
  wasDeferred: boolean;
}

export interface Avatar {
  name: string;
  activeSkillId: SkillId;
  createdAt: string;
}

export interface SkillProgress {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  levelProgress: number;
  deferralsUsed: number;
  deferredUntil: string | null;
  startedAt: string;
  pathCompletedAt: string | null;
}

export type ProgressMap = Partial<Record<SkillId, SkillProgress>>;
