import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { assessments } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const assessmentRouter = createRouter({
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
      return getDb().query.assessments.findFirst({
        where: eq(assessments.id, input.id),
      });
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
