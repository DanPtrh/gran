import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, Completion, ProgressMap, SkillId, SkillProgress } from '../types';

const KEYS = {
  avatar: 'mindprog:avatar',
  progress: 'mindprog:progress',
  completions: 'mindprog:completions',
} as const;

const LEGACY_DEFERRED_KEY = 'mindprog:deferredTaskId';

function freshProgress(): SkillProgress {
  return {
    currentLevel: 1,
    levelProgress: 0,
    deferralsUsed: 0,
    deferredUntil: null,
    startedAt: new Date().toISOString(),
    pathCompletedAt: null,
  };
}

function normalizeProgress(p: Partial<SkillProgress> | undefined): SkillProgress {
  return {
    currentLevel: p?.currentLevel ?? 1,
    levelProgress: p?.levelProgress ?? 0,
    deferralsUsed: p?.deferralsUsed ?? 0,
    deferredUntil: p?.deferredUntil ?? null,
    startedAt: p?.startedAt ?? new Date().toISOString(),
    pathCompletedAt: p?.pathCompletedAt ?? null,
  };
}

export async function loadAvatar(): Promise<Avatar | null> {
  const raw = await AsyncStorage.getItem(KEYS.avatar);
  if (!raw) return null;
  const parsed = JSON.parse(raw);

  if ('skillId' in parsed && !('activeSkillId' in parsed)) {
    return migrateLegacyAvatar(parsed);
  }
  return parsed as Avatar;
}

async function migrateLegacyAvatar(legacy: any): Promise<Avatar> {
  const skillId: SkillId = legacy.skillId;
  const avatar: Avatar = {
    name: legacy.name,
    activeSkillId: skillId,
    createdAt: legacy.createdAt ?? new Date().toISOString(),
  };
  const progress: SkillProgress = {
    currentLevel: legacy.currentLevel ?? 1,
    levelProgress: legacy.levelProgress ?? 0,
    deferralsUsed: legacy.deferralsUsed ?? 0,
    deferredUntil: legacy.deferredUntil ?? null,
    startedAt: legacy.createdAt ?? new Date().toISOString(),
    pathCompletedAt: null,
  };
  const map: ProgressMap = { [skillId]: progress };
  await AsyncStorage.multiSet([
    [KEYS.avatar, JSON.stringify(avatar)],
    [KEYS.progress, JSON.stringify(map)],
  ]);
  await AsyncStorage.removeItem(LEGACY_DEFERRED_KEY);
  return avatar;
}

export async function saveAvatar(avatar: Avatar): Promise<void> {
  await AsyncStorage.setItem(KEYS.avatar, JSON.stringify(avatar));
}

export async function loadProgress(): Promise<ProgressMap> {
  const raw = await AsyncStorage.getItem(KEYS.progress);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as Partial<Record<SkillId, Partial<SkillProgress>>>;
  const normalized: ProgressMap = {};
  for (const id of Object.keys(parsed) as SkillId[]) {
    if (parsed[id]) normalized[id] = normalizeProgress(parsed[id]);
  }
  return normalized;
}

export async function saveProgress(map: ProgressMap): Promise<void> {
  await AsyncStorage.setItem(KEYS.progress, JSON.stringify(map));
}

export async function getOrCreateProgress(skillId: SkillId): Promise<SkillProgress> {
  const map = await loadProgress();
  if (map[skillId]) return map[skillId]!;
  const fresh = freshProgress();
  await saveProgress({ ...map, [skillId]: fresh });
  return fresh;
}

export async function updateProgress(skillId: SkillId, progress: SkillProgress): Promise<void> {
  const map = await loadProgress();
  await saveProgress({ ...map, [skillId]: progress });
}

export async function setActiveSkill(skillId: SkillId): Promise<Avatar> {
  const avatar = await loadAvatar();
  if (!avatar) throw new Error('No avatar');
  const next: Avatar = { ...avatar, activeSkillId: skillId };
  await saveAvatar(next);
  await getOrCreateProgress(skillId);
  return next;
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.avatar,
    KEYS.progress,
    KEYS.completions,
    LEGACY_DEFERRED_KEY,
  ]);
}

export async function loadCompletions(): Promise<Completion[]> {
  const raw = await AsyncStorage.getItem(KEYS.completions);
  return raw ? (JSON.parse(raw) as Completion[]) : [];
}

export async function addCompletion(c: Completion): Promise<void> {
  const list = await loadCompletions();
  list.push(c);
  await AsyncStorage.setItem(KEYS.completions, JSON.stringify(list));
}
