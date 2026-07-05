import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { students } from "@db/schema";
import { eq } from "drizzle-orm";

export const studentRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return getDb().query.students.findMany({
      where: eq(students.parentId, ctx.user.id),
    });
  }),

  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.students.findFirst({
        where: eq(students.id, input.id),
      });
    }),

  create: authedQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        age: z.number().min(8).max(15),
        grade: z.string().min(1),
        ethnicitySelfReported: z.string().optional(),
        avatarUrl: z.string().optional(),
        interests: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await getDb()
        .insert(students)
        .values({
          ...input,
          parentId: ctx.user.id,
        });
      const id = Number(result[0].insertId);
      return getDb().query.students.findFirst({ where: eq(students.id, id) });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        fullName: z.string().min(1).optional(),
        age: z.number().min(8).max(15).optional(),
        grade: z.string().optional(),
        ethnicitySelfReported: z.string().optional(),
        avatarUrl: z.string().optional(),
        interests: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb()
        .update(students)
        .set(data)
        .where(eq(students.id, id));
      return getDb().query.students.findFirst({ where: eq(students.id, id) });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(students).where(eq(students.id, input.id));
      return { success: true };
    }),
});
