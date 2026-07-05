import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { moduleProgress, studyModules } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const progressRouter = createRouter({
  getByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const progress = await getDb().query.moduleProgress.findMany({
        where: eq(moduleProgress.studentId, input.studentId),
      });

      // Calculate summary stats
      const totalModules = progress.length;
      const completedModules = progress.filter((p) => p.completedAt).length;
      const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
      const totalCoins = progress.reduce((sum, p) => sum + p.coinsEarned, 0);

      return {
        details: progress,
        summary: {
          totalModules,
          completedModules,
          completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
          totalTimeSpent,
          totalCoins,
        },
      };
    }),

  getByModule: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        moduleId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return getDb().query.moduleProgress.findFirst({
        where: and(
          eq(moduleProgress.studentId, input.studentId),
          eq(moduleProgress.moduleId, input.moduleId),
        ),
      });
    }),

  upsert: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        moduleId: z.number(),
        lessonsCompleted: z.number().optional(),
        totalLessons: z.number(),
        timeSpent: z.number().optional(),
        coinsEarned: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getDb().query.moduleProgress.findFirst({
        where: and(
          eq(moduleProgress.studentId, input.studentId),
          eq(moduleProgress.moduleId, input.moduleId),
        ),
      });

      if (existing) {
        const isCompleted =
          input.lessonsCompleted !== undefined &&
          input.lessonsCompleted >= input.totalLessons;

        await getDb()
          .update(moduleProgress)
          .set({
            lessonsCompleted: input.lessonsCompleted ?? existing.lessonsCompleted,
            totalLessons: input.totalLessons,
            timeSpent: existing.timeSpent + (input.timeSpent ?? 0),
            coinsEarned: existing.coinsEarned + (input.coinsEarned ?? 0),
            lastAccessedAt: new Date(),
            completedAt: isCompleted ? new Date() : existing.completedAt,
          })
          .where(eq(moduleProgress.id, existing.id));

        return getDb().query.moduleProgress.findFirst({
          where: eq(moduleProgress.id, existing.id),
        });
      } else {
        const result = await getDb()
          .insert(moduleProgress)
          .values({
            studentId: input.studentId,
            moduleId: input.moduleId,
            lessonsCompleted: input.lessonsCompleted ?? 0,
            totalLessons: input.totalLessons,
            timeSpent: input.timeSpent ?? 0,
            coinsEarned: input.coinsEarned ?? 0,
            lastAccessedAt: new Date(),
          });
        const id = Number(result[0].insertId);

        return getDb().query.moduleProgress.findFirst({
          where: eq(moduleProgress.id, id),
        });
      }
    }),

  getStats: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const modules = await getDb().query.studyModules.findMany({
        where: eq(studyModules.studentId, input.studentId),
      });
      const progress = await getDb().query.moduleProgress.findMany({
        where: eq(moduleProgress.studentId, input.studentId),
      });

      const domains = ["history", "language", "food", "dress"] as const;
      const domainStats = domains.map((domain) => {
        const domainModules = modules.filter((m) => m.domain === domain);
        const domainProgress = progress.filter((p) =>
          domainModules.some((m) => m.id === p.moduleId),
        );
        const completed = domainProgress.filter((p) => p.completedAt).length;
        const total = domainModules.length;
        return {
          domain,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });

      const overall = {
        totalModules: modules.length,
        completedModules: progress.filter((p) => p.completedAt).length,
        totalTimeSpent: progress.reduce((s, p) => s + p.timeSpent, 0),
        totalCoins: progress.reduce((s, p) => s + p.coinsEarned, 0),
      };

      return { overall, domains: domainStats };
    }),
});
