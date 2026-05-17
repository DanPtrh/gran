import { Task, SkillId } from '../types';
import { NavigatorScreenParams } from '@react-navigation/native';
import { TabParamList } from './TabNavigator';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  TaskDetail: { task: Task };
  Reflection: { task: Task };
  AvatarMessage: { message: string; level: number };
  LevelUp: { newLevel: number; avatarMessage: string };
  PathCompleted: { skillId: SkillId };
};
