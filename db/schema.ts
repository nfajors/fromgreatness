import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  timestamp,
  int,
  json,
  decimal,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

// ─── Users (Parents) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  // unionId is the stable external identity key. For email/password accounts
  // we set it to "email:<address>"; for OAuth it is the provider union id.
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  // Hashed password (scrypt). Null for OAuth-only accounts.
  passwordHash: varchar("passwordHash", { length: 255 }),
  authProvider: mysqlEnum("authProvider", ["password", "google", "apple", "kimi"])
    .default("password")
    .notNull(),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Stripe customer id, set on first checkout
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Students (Children) ───
export const students = mysqlTable("students", {
  id: serial("id").primaryKey(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  age: int("age").notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  ethnicitySelfReported: text("ethnicitySelfReported"),
  avatarUrl: text("avatarUrl"),
  interests: json("interests").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("parentId_idx").on(table.parentId),
]);

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

// ─── Assessments ───
export const assessments = mysqlTable("assessments", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["personality", "achievement", "cultural_identity"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  responses: json("responses").$type<Record<string, unknown>>(),
  score: int("score"),
  traits: json("traits").$type<string[]>(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("studentId_idx").on(table.studentId),
  index("type_idx").on(table.type),
]);

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

// ─── DNA Results ───
export const dnaResults = mysqlTable("dna_results", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(), // 23andMe, AncestryDNA, raw
  rawData: json("rawData").$type<Record<string, unknown>>(),
  ancestrySummary: json("ancestrySummary").$type<AncestryRegion[]>(),
  primaryRegion: varchar("primaryRegion", { length: 255 }),
  primaryPercentage: decimal("primaryPercentage", { precision: 5, scale: 2 }),
  haplogroups: json("haplogroups").$type<Record<string, string>>(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
}, (table) => [
  index("dna_studentId_idx").on(table.studentId),
]);

export type DnaResult = typeof dnaResults.$inferSelect;
export type InsertDnaResult = typeof dnaResults.$inferInsert;

export type AncestryRegion = {
  region: string;
  percentage: number;
  color?: string;
};

// ─── Gap Analyses ───
export const gapAnalyses = mysqlTable("gap_analyses", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  existingIdentity: json("existingIdentity").$type<Record<string, number>>(),
  geneticProfile: json("geneticProfile").$type<Record<string, number>>(),
  gapScore: decimal("gapScore", { precision: 5, scale: 2 }).notNull(),
  domainGaps: json("domainGaps").$type<DomainGap[]>(),
  keyInsights: json("keyInsights").$type<KeyInsight[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("gap_studentId_idx").on(table.studentId),
]);

export type GapAnalysis = typeof gapAnalyses.$inferSelect;
export type InsertGapAnalysis = typeof gapAnalyses.$inferInsert;

export type DomainGap = {
  domain: string;
  currentLevel: number;
  heritageLevel: number;
  gap: number;
  priority: "high" | "medium" | "low";
};

export type KeyInsight = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  domain: string;
};

// ─── Study Plans ───
export const studyPlans = mysqlTable("study_plans", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  domain: mysqlEnum("domain", ["history", "language", "food", "dress"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  intensityLevel: mysqlEnum("intensityLevel", ["low", "medium", "high"]).default("medium").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  overallProgress: int("overallProgress").default(0).notNull(),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("plan_studentId_idx").on(table.studentId),
  index("domain_idx").on(table.domain),
]);

export type StudyPlan = typeof studyPlans.$inferSelect;
export type InsertStudyPlan = typeof studyPlans.$inferInsert;

// ─── Study Modules ───
export const studyModules = mysqlTable("study_modules", {
  id: serial("id").primaryKey(),
  planId: bigint("planId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  domain: mysqlEnum("domain", ["history", "language", "food", "dress"]).notNull(),
  orderIndex: int("orderIndex").notNull(),
  duration: int("duration").notNull(), // minutes
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  lessons: json("lessons").$type<Lesson[]>(),
  status: mysqlEnum("status", ["locked", "unlocked", "in_progress", "completed"]).default("locked").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("module_planId_idx").on(table.planId),
  index("module_studentId_idx").on(table.studentId),
]);

export type StudyModule = typeof studyModules.$inferSelect;
export type InsertStudyModule = typeof studyModules.$inferInsert;

export type Lesson = {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz" | "activity";
  duration: number;
  completed: boolean;
  content?: string;
};

// ─── Module Progress ───
export const moduleProgress = mysqlTable("module_progress", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  moduleId: bigint("moduleId", { mode: "number", unsigned: true }).notNull(),
  lessonsCompleted: int("lessonsCompleted").default(0).notNull(),
  totalLessons: int("totalLessons").notNull(),
  timeSpent: int("timeSpent").default(0).notNull(), // minutes
  lastAccessedAt: timestamp("lastAccessedAt"),
  completedAt: timestamp("completedAt"),
  coinsEarned: int("coinsEarned").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("progress_studentId_idx").on(table.studentId),
  index("progress_moduleId_idx").on(table.moduleId),
]);

export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type InsertModuleProgress = typeof moduleProgress.$inferInsert;

// ─── Parent Actions ───
export const parentActions = mysqlTable("parent_actions", {
  id: serial("id").primaryKey(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  actionType: mysqlEnum("actionType", [
    "study_reminder",
    "video_review",
    "progress_report",
    "achievement",
    "assessment_complete",
    "module_complete",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  gamificationPoints: int("gamificationPoints").default(0).notNull(),
  relatedEntityId: bigint("relatedEntityId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("action_parentId_idx").on(table.parentId),
  index("action_studentId_idx").on(table.studentId),
]);

export type ParentAction = typeof parentActions.$inferSelect;
export type InsertParentAction = typeof parentActions.$inferInsert;

// ─── Achievements ───
export const achievements = mysqlTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  category: mysqlEnum("category", [
    "streak",
    "module",
    "domain",
    "assessment",
    "social",
    "milestone",
  ]).notNull(),
  requirementType: varchar("requirementType", { length: 100 }).notNull(),
  requirementValue: int("requirementValue").notNull(),
  coinsReward: int("coinsReward").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// ─── Student Achievements ───
export const studentAchievements = mysqlTable("student_achievements", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  achievementId: bigint("achievementId", { mode: "number", unsigned: true }).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
}, (table) => [
  index("sa_studentId_idx").on(table.studentId),
  index("sa_achievementId_idx").on(table.achievementId),
]);

export type StudentAchievement = typeof studentAchievements.$inferSelect;
export type InsertStudentAchievement = typeof studentAchievements.$inferInsert;

// ─── Subscriptions ───
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }).notNull().unique(),
  plan: mysqlEnum("plan", ["annual", "monthly", "sponsored"]).default("annual").notNull(),
  status: mysqlEnum("status", ["incomplete", "active", "cancelled", "expired", "past_due"])
    .default("incomplete")
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  // Stripe linkage
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Activity Feed ───
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", [
    "assessment_completed",
    "module_completed",
    "lesson_completed",
    "achievement_earned",
    "heritage_confirmed",
    "plan_generated",
    "streak_milestone",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  coinsAwarded: int("coinsAwarded").default(0).notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("act_studentId_idx").on(table.studentId),
]);

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// ─── Parental Consents (COPPA audit trail) ───
export const parentalConsents = mysqlTable("parental_consents", {
  id: serial("id").primaryKey(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }),
  guardianName: varchar("guardianName", { length: 255 }).notNull(),
  consentDataCollection: boolean("consentDataCollection").default(false).notNull(),
  consentCommunication: boolean("consentCommunication").default(false).notNull(),
  consentPhotoVideo: boolean("consentPhotoVideo").default(false).notNull(),
  consentTerms: boolean("consentTerms").default(false).notNull(),
  consentTextVersion: varchar("consentTextVersion", { length: 50 }).notNull(),
  signatureProvided: boolean("signatureProvided").default(false).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("pc_parentId_idx").on(table.parentId),
]);

export type ParentalConsent = typeof parentalConsents.$inferSelect;
export type InsertParentalConsent = typeof parentalConsents.$inferInsert;
