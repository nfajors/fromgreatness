import { relations } from "drizzle-orm";
import {
  users,
  students,
  assessments,
  dnaResults,
  gapAnalyses,
  studyPlans,
  studyModules,
  moduleProgress,
  parentActions,
  achievements,
  studentAchievements,
  subscriptions,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  actions: many(parentActions),
  subscription: many(subscriptions),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(users, { fields: [students.parentId], references: [users.id] }),
  assessments: many(assessments),
  dnaResults: many(dnaResults),
  gapAnalyses: many(gapAnalyses),
  studyPlans: many(studyPlans),
  modules: many(studyModules),
  progress: many(moduleProgress),
  achievements: many(studentAchievements),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  student: one(students, { fields: [assessments.studentId], references: [students.id] }),
}));

export const dnaResultsRelations = relations(dnaResults, ({ one }) => ({
  student: one(students, { fields: [dnaResults.studentId], references: [students.id] }),
}));

export const gapAnalysesRelations = relations(gapAnalyses, ({ one }) => ({
  student: one(students, { fields: [gapAnalyses.studentId], references: [students.id] }),
}));

export const studyPlansRelations = relations(studyPlans, ({ one, many }) => ({
  student: one(students, { fields: [studyPlans.studentId], references: [students.id] }),
  modules: many(studyModules),
}));

export const studyModulesRelations = relations(studyModules, ({ one }) => ({
  plan: one(studyPlans, { fields: [studyModules.planId], references: [studyPlans.id] }),
  student: one(students, { fields: [studyModules.studentId], references: [students.id] }),
}));

export const moduleProgressRelations = relations(moduleProgress, ({ one }) => ({
  student: one(students, { fields: [moduleProgress.studentId], references: [students.id] }),
  module: one(studyModules, { fields: [moduleProgress.moduleId], references: [studyModules.id] }),
}));

export const parentActionsRelations = relations(parentActions, ({ one }) => ({
  parent: one(users, { fields: [parentActions.parentId], references: [users.id] }),
}));

export const studentAchievementsRelations = relations(studentAchievements, ({ one }) => ({
  student: one(students, { fields: [studentAchievements.studentId], references: [students.id] }),
  achievement: one(achievements, { fields: [studentAchievements.achievementId], references: [achievements.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  parent: one(users, { fields: [subscriptions.parentId], references: [users.id] }),
}));
