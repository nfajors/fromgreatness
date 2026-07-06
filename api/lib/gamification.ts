import { eq, desc, and, gte } from "drizzle-orm";
import { getDb } from "../queries/connection";
import {
  activities,
  achievements,
  studentAchievements,
  moduleProgress,
  assessments,
  dnaResults,
  type InsertActivity,
} from "@db/schema";

/**
 * Gamification engine.
 *
 * Design notes:
 * - Coins are the earned currency: from completed modules (moduleProgress.coinsEarned)
 *   plus achievement rewards. XP is derived (coins are XP) so there is a single
 *   source of truth and no drift between two ledgers.
 * - Levels use a simple ramp: each level requires 250 XP more than the last
 *   threshold (L1: 0, L2: 250, L3: 500, ...). Titles give kids a sense of identity.
 * - Streaks are computed from activity timestamps: consecutive calendar days
 *   (UTC) with at least one activity, counting back from today or yesterday.
 */

// ─── Activity recording ───

export async function recordActivity(input: {
  studentId: number;
  type: InsertActivity["type"];
  title: string;
  subtitle?: string;
  coinsAwarded?: number;
}): Promise<void> {
  await getDb().insert(activities).values({
    studentId: input.studentId,
    type: input.type,
    title: input.title.slice(0, 255),
    subtitle: input.subtitle?.slice(0, 500),
    coinsAwarded: input.coinsAwarded ?? 0,
  });
}

// ─── Streaks ───

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function computeStreak(studentId: number): Promise<number> {
  // Pull recent activity timestamps (90 days is plenty for a streak display).
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const rows = await getDb()
    .select({ createdAt: activities.createdAt })
    .from(activities)
    .where(and(eq(activities.studentId, studentId), gte(activities.createdAt, since)))
    .orderBy(desc(activities.createdAt));

  if (rows.length === 0) return 0;

  const days = new Set(rows.map((r) => dayKey(r.createdAt)));
  const today = new Date();

  // The streak may end today or (if nothing yet today) yesterday.
  let cursor = new Date(today);
  if (!days.has(dayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

// ─── XP & Levels ───

const LEVEL_TITLES = [
  "Seedling",          // 1
  "Root Finder",       // 2
  "Story Seeker",      // 3
  "Heritage Scout",    // 4
  "Culture Explorer",  // 5
  "Tradition Keeper",  // 6
  "History Guardian",  // 7
  "Legacy Builder",    // 8
  "Wisdom Carrier",    // 9
  "Greatness Bearer",  // 10+
];

export function levelFromXp(xp: number): {
  num: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPct: number;
} {
  const num = Math.max(1, Math.floor(xp / 250) + 1);
  const currentLevelXp = (num - 1) * 250;
  const nextLevelXp = num * 250;
  const progressPct = Math.round(((xp - currentLevelXp) / 250) * 100);
  return {
    num,
    title: LEVEL_TITLES[Math.min(num - 1, LEVEL_TITLES.length - 1)],
    currentLevelXp,
    nextLevelXp,
    progressPct,
  };
}

export async function computeTotals(studentId: number): Promise<{
  coins: number;
  xp: number;
  modulesCompleted: number;
  weeklyModules: number;
}> {
  const progress = await getDb().query.moduleProgress.findMany({
    where: eq(moduleProgress.studentId, studentId),
  });
  const earnedAchievements = await getDb().query.studentAchievements.findMany({
    where: eq(studentAchievements.studentId, studentId),
  });
  const allAch = earnedAchievements.length
    ? await getDb().query.achievements.findMany()
    : [];
  const achCoins = earnedAchievements.reduce((sum, ea) => {
    const a = allAch.find((x) => x.id === ea.achievementId);
    return sum + (a?.coinsReward ?? 0);
  }, 0);

  const moduleCoins = progress.reduce((s, p) => s + p.coinsEarned, 0);
  const completed = progress.filter((p) => p.completedAt != null);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyModules = completed.filter(
    (p) => p.completedAt && p.completedAt >= weekAgo,
  ).length;

  const coins = moduleCoins + achCoins;
  return { coins, xp: coins, modulesCompleted: completed.length, weeklyModules };
}

// ─── Achievements: seed + auto-award ───

export const ACHIEVEMENT_SEED = [
  { name: "First Steps", description: "Complete your first assessment", icon: "footprints", category: "assessment" as const, requirementType: "assessments_completed", requirementValue: 1, coinsReward: 25 },
  { name: "Know Thyself", description: "Complete all three assessments", icon: "brain", category: "assessment" as const, requirementType: "assessments_completed", requirementValue: 3, coinsReward: 75 },
  { name: "Roots Confirmed", description: "Confirm your heritage", icon: "dna", category: "milestone" as const, requirementType: "heritage_confirmed", requirementValue: 1, coinsReward: 50 },
  { name: "First Module", description: "Complete your first learning module", icon: "book-open", category: "module" as const, requirementType: "modules_completed", requirementValue: 1, coinsReward: 25 },
  { name: "Knowledge Builder", description: "Complete 5 learning modules", icon: "library", category: "module" as const, requirementType: "modules_completed", requirementValue: 5, coinsReward: 100 },
  { name: "Scholar", description: "Complete 15 learning modules", icon: "graduation-cap", category: "module" as const, requirementType: "modules_completed", requirementValue: 15, coinsReward: 250 },
  { name: "3-Day Streak", description: "Learn 3 days in a row", icon: "flame", category: "streak" as const, requirementType: "streak_days", requirementValue: 3, coinsReward: 30 },
  { name: "Week of Greatness", description: "Learn 7 days in a row", icon: "flame", category: "streak" as const, requirementType: "streak_days", requirementValue: 7, coinsReward: 100 },
];

export async function ensureAchievementsSeeded(): Promise<void> {
  const existing = await getDb().query.achievements.findMany();
  if (existing.length > 0) return;
  await getDb().insert(achievements).values(ACHIEVEMENT_SEED);
}

/**
 * Evaluate all achievement rules for a student and award any newly met ones.
 * Idempotent: already-earned achievements are skipped. Newly earned ones are
 * recorded in the activity feed. Returns the names of newly earned achievements.
 */
export async function checkAndAwardAchievements(studentId: number): Promise<string[]> {
  await ensureAchievementsSeeded();

  const [allAch, earned, totals, streak, studentAssessments, dna] = await Promise.all([
    getDb().query.achievements.findMany(),
    getDb().query.studentAchievements.findMany({
      where: eq(studentAchievements.studentId, studentId),
    }),
    computeTotals(studentId),
    computeStreak(studentId),
    getDb().query.assessments.findMany({
      where: eq(assessments.studentId, studentId),
    }),
    getDb().query.dnaResults.findFirst({
      where: eq(dnaResults.studentId, studentId),
    }),
  ]);

  const earnedIds = new Set(earned.map((e) => e.achievementId));
  const assessmentsCompleted = studentAssessments.filter((a) => a.status === "completed").length;

  const metricFor = (type: string): number => {
    switch (type) {
      case "assessments_completed": return assessmentsCompleted;
      case "modules_completed": return totals.modulesCompleted;
      case "streak_days": return streak;
      case "heritage_confirmed": return dna ? 1 : 0;
      default: return 0;
    }
  };

  const newlyEarned: string[] = [];
  for (const ach of allAch) {
    if (earnedIds.has(ach.id)) continue;
    if (metricFor(ach.requirementType) >= ach.requirementValue) {
      await getDb().insert(studentAchievements).values({
        studentId,
        achievementId: ach.id,
      });
      await recordActivity({
        studentId,
        type: "achievement_earned",
        title: `New achievement: ${ach.name}!`,
        subtitle: ach.description,
        coinsAwarded: ach.coinsReward,
      });
      newlyEarned.push(ach.name);
    }
  }
  return newlyEarned;
}
