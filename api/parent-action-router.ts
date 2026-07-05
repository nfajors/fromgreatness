import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { parentActions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const parentActionRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        parentId: z.number(),
        studentId: z.number().optional(),
        completed: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      let query = getDb()
        .select()
        .from(parentActions)
        .where(eq(parentActions.parentId, input.parentId))
        .orderBy(desc(parentActions.createdAt));

      const results = await query;

      return results.filter((a) => {
        if (input.studentId && a.studentId !== input.studentId) return false;
        if (input.completed !== undefined && a.completed !== input.completed) return false;
        return true;
      });
    }),

  create: authedQuery
    .input(
      z.object({
        parentId: z.number(),
        studentId: z.number(),
        actionType: z.enum([
          "study_reminder",
          "video_review",
          "progress_report",
          "achievement",
          "assessment_complete",
          "module_complete",
        ]),
        title: z.string().min(1),
        description: z.string().optional(),
        gamificationPoints: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await getDb()
        .insert(parentActions)
        .values({
          parentId: input.parentId,
          studentId: input.studentId,
          actionType: input.actionType,
          title: input.title,
          description: input.description,
          gamificationPoints: input.gamificationPoints,
        });
      const id = Number(result[0].insertId);
      return getDb().query.parentActions.findFirst({
        where: eq(parentActions.id, id),
      });
    }),

  markCompleted: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(parentActions)
        .set({ completed: true })
        .where(eq(parentActions.id, input.id));
      return getDb().query.parentActions.findFirst({
        where: eq(parentActions.id, input.id),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(parentActions).where(eq(parentActions.id, input.id));
      return { success: true };
    }),
});
