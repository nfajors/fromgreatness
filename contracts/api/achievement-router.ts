import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { achievements, studentAchievements } from "@db/schema";
import { eq } from "drizzle-orm";

export const achievementRouter = createRouter({
  list: authedQuery.query(async () => {
    return getDb().query.achievements.findMany();
  }),

  getByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const allAchievements = await getDb().query.achievements.findMany();
      const earned = await getDb().query.studentAchievements.findMany({
        where: eq(studentAchievements.studentId, input.studentId),
      });

      const earnedIds = new Set(earned.map((e) => e.achievementId));

      return allAchievements.map((ach) => ({
        ...ach,
        earned: earnedIds.has(ach.id),
        earnedAt: earned.find((e) => e.achievementId === ach.id)?.earnedAt,
      }));
    }),

  award: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        achievementId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if already earned
      const existing = await getDb().query.studentAchievements.findFirst({
        where: eq(studentAchievements.studentId, input.studentId),
      });

      if (existing && existing.achievementId === input.achievementId) {
        return existing;
      }

      const result = await getDb()
        .insert(studentAchievements)
        .values({
          studentId: input.studentId,
          achievementId: input.achievementId,
        });
      const id = Number(result[0].insertId);

      return getDb().query.studentAchievements.findFirst({
        where: eq(studentAchievements.id, id),
      });
    }),

  seed: authedQuery.mutation(async () => {
    const existing = await getDb().query.achievements.findMany();
    if (existing.length > 0) return { alreadySeeded: true, count: existing.length };

    const defaultAchievements = [
      { name: "First Steps", description: "Complete your first learning module", icon: "Footprints", category: "module" as const, requirementType: "modules_completed", requirementValue: 1, coinsReward: 50 },
      { name: "Streak Starter", description: "Maintain a 3-day learning streak", icon: "Flame", category: "streak" as const, requirementType: "streak_days", requirementValue: 3, coinsReward: 100 },
      { name: "Week Warrior", description: "Maintain a 7-day learning streak", icon: "Flame", category: "streak" as const, requirementType: "streak_days", requirementValue: 7, coinsReward: 200 },
      { name: "History Buff", description: "Complete 3 History modules", icon: "Scroll", category: "domain" as const, requirementType: "history_modules", requirementValue: 3, coinsReward: 150 },
      { name: "Language Learner", description: "Complete 3 Language modules", icon: "Languages", category: "domain" as const, requirementType: "language_modules", requirementValue: 3, coinsReward: 150 },
      { name: "Food Explorer", description: "Complete 3 Food modules", icon: "Utensils", category: "domain" as const, requirementType: "food_modules", requirementValue: 3, coinsReward: 150 },
      { name: "Culture Keeper", description: "Complete 3 Dress modules", icon: "Shirt", category: "domain" as const, requirementType: "dress_modules", requirementValue: 3, coinsReward: 150 },
      { name: "Video Star", description: "Submit your first video assessment", icon: "Video", category: "assessment" as const, requirementType: "videos_submitted", requirementValue: 1, coinsReward: 100 },
      { name: "Halfway There", description: "Complete 50% of all assigned modules", icon: "Target", category: "milestone" as const, requirementType: "modules_percentage", requirementValue: 50, coinsReward: 300 },
      { name: "Master Scholar", description: "Complete all assigned modules", icon: "Crown", category: "milestone" as const, requirementType: "modules_percentage", requirementValue: 100, coinsReward: 500 },
    ];

    await getDb().insert(achievements).values(defaultAchievements);
    return { seeded: true, count: defaultAchievements.length };
  }),
});
