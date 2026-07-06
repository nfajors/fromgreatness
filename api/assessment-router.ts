import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { assessments, dnaResults, students } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { aiEnabled } from "./lib/env";
import { generateQuestionsWithAI, type GenQuestion } from "./lib/ai-content";
import { recordActivity, checkAndAwardAchievements } from "./lib/gamification";

export const assessmentRouter = createRouter({
  // ─── DNA-driven question generation for heritage tests ───
  // Returns AI-generated questions grounded in the child's heritage, or
  // { source: 'fallback' } so the client uses its static question set.
  generateQuestions: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        test: z.enum(["achievement", "cultural_identity"]),
        count: z.number().min(5).max(30).default(15),
      }),
    )
    .mutation(async ({ input }) => {
      const student = await getDb().query.students.findFirst({
        where: eq(students.id, input.studentId),
      });
      const dna = await getDb().query.dnaResults.findFirst({
        where: eq(dnaResults.studentId, input.studentId),
      });

      const heritageRegions =
        dna?.ancestrySummary?.map((r) => ({
          region: r.region,
          percentage: r.percentage,
        })) ?? [];

      // No heritage or AI disabled → tell client to use static questions.
      if (!aiEnabled || !student || heritageRegions.length === 0) {
        return { source: "fallback" as const, questions: [] as GenQuestion[] };
      }

      try {
        const questions = await generateQuestionsWithAI({
          test: input.test,
          studentAge: student.age,
          heritageRegions,
          count: input.count,
        });
        if (!questions.length) {
          return { source: "fallback" as const, questions: [] as GenQuestion[] };
        }
        return { source: "ai" as const, questions };
      } catch (err) {
        console.warn(`[ai] question generation failed for ${input.test}:`, err);
        return { source: "fallback" as const, questions: [] as GenQuestion[] };
      }
    }),

  listByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.assessments.findMany({
        where: eq(assessments.studentId, input.studentId),
      });
    }),

  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.assessments.findFirst({
        where: eq(assessments.id, input.id),
      });
    }),

  getOrCreate: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        type: z.enum(["personality", "achievement", "cultural_identity"]),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getDb().query.assessments.findFirst({
        where: and(
          eq(assessments.studentId, input.studentId),
          eq(assessments.type, input.type),
        ),
      });
      if (existing) return existing;

      const result = await getDb()
        .insert(assessments)
        .values({
          studentId: input.studentId,
          type: input.type,
          status: "pending",
        });
      const id = Number(result[0].insertId);
      return getDb().query.assessments.findFirst({ where: eq(assessments.id, id) });
    }),

  submitResponse: authedQuery
    .input(
      z.object({
        id: z.number(),
        responses: z.record(z.string(), z.unknown()),
        score: z.number().optional(),
        traits: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(assessments)
        .set({
          responses: input.responses,
          score: input.score,
          traits: input.traits,
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(assessments.id, input.id));
      const updated = await getDb().query.assessments.findFirst({
        where: eq(assessments.id, input.id),
      });

      // Gamification: log the completion and award any newly met achievements.
      if (updated) {
        const label =
          updated.type === "personality"
            ? "Personality Test"
            : updated.type === "achievement"
              ? "Achievement Test"
              : "Cultural Identity Test";
        await recordActivity({
          studentId: updated.studentId,
          type: "assessment_completed",
          title: `Completed the ${label}`,
          subtitle: input.score != null ? `Score: ${input.score}%` : undefined,
        }).catch(() => {});
        await checkAndAwardAchievements(updated.studentId).catch(() => {});
      }
      return updated;
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
      }),
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(assessments)
        .set({ status: input.status })
        .where(eq(assessments.id, input.id));
      return getDb().query.assessments.findFirst({
        where: eq(assessments.id, input.id),
      });
    }),
});
