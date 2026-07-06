import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { activities } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import {
  computeStreak,
  computeTotals,
  levelFromXp,
  checkAndAwardAchievements,
} from "./lib/gamification";

const WEEKLY_GOAL_MODULES = 5;

export const activityRouter = createRouter({
  // Recent activity feed for a student (newest first).
  listByStudent: authedQuery
    .input(z.object({ studentId: z.number(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      return getDb().query.activities.findMany({
        where: eq(activities.studentId, input.studentId),
        orderBy: [desc(activities.createdAt)],
        limit: input.limit,
      });
    }),

  markAllRead: authedQuery
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(activities)
        .set({ read: true })
        .where(eq(activities.studentId, input.studentId));
      return { success: true };
    }),

  // One-call gamification summary: coins, xp, level, streak, weekly goal.
  summary: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      // Opportunistically award any achievements the student now qualifies for,
      // so the summary is always up to date when a screen loads.
      await checkAndAwardAchievements(input.studentId).catch(() => {});

      const [totals, streak] = await Promise.all([
        computeTotals(input.studentId),
        computeStreak(input.studentId),
      ]);
      const level = levelFromXp(totals.xp);

      return {
        coins: totals.coins,
        xp: totals.xp,
        level,
        streakDays: streak,
        modulesCompleted: totals.modulesCompleted,
        weeklyModules: totals.weeklyModules,
        weeklyGoal: WEEKLY_GOAL_MODULES,
        weeklyGoalPct: Math.min(100, Math.round((totals.weeklyModules / WEEKLY_GOAL_MODULES) * 100)),
      };
    }),
});
