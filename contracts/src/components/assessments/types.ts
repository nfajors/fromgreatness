export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';

export type AssessmentView = 'overview' | 'personality' | 'achievement' | 'cultural' | 'complete';

export interface AssessmentAnswers {
  personality: Record<number, number>;
  achievement: Record<number, number>;
  cultural: Record<number, number | number[] | string>;
}
