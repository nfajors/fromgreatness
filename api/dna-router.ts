import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dnaResults } from "@db/schema";
import { eq } from "drizzle-orm";
import { parseDnaFile } from "./lib/dna-parser";

export const dnaRouter = createRouter({
  getByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.dnaResults.findFirst({
        where: eq(dnaResults.studentId, input.studentId),
      });
    }),

  // ─── Parse a raw 23andMe / Ancestry export (client sends file text) ───
  parseRaw: authedQuery
    .input(
      z.object({
        // Cap input to keep payloads sane; raw files are large but text.
        fileText: z.string().min(1).max(60 * 1024 * 1024),
      }),
    )
    .mutation(async ({ input }) => {
      const parsed = parseDnaFile(input.fileText);
      return parsed;
    }),

  upload: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        provider: z.string(),
        rawData: z.record(z.string(), z.unknown()).optional(),
        ancestrySummary: z
          .array(
            z.object({
              region: z.string(),
              percentage: z.number(),
              color: z.string().optional(),
            }),
          )
          .optional(),
        primaryRegion: z.string().optional(),
        primaryPercentage: z.number().optional(),
        haplogroups: z.record(z.string(), z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Upsert: delete existing first
      await getDb()
        .delete(dnaResults)
        .where(eq(dnaResults.studentId, input.studentId));

      const result = await getDb()
        .insert(dnaResults)
        .values({
          studentId: input.studentId,
          provider: input.provider,
          rawData: input.rawData as Record<string, string> | null,
          ancestrySummary: input.ancestrySummary,
          primaryRegion: input.primaryRegion,
          primaryPercentage: input.primaryPercentage?.toString(),
          haplogroups: input.haplogroups as Record<string, string> | null,
        });
      const id = Number(result[0].insertId);
      return getDb().query.dnaResults.findFirst({
        where: eq(dnaResults.id, id),
      });
    }),

  delete: authedQuery
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(dnaResults)
        .where(eq(dnaResults.studentId, input.studentId));
      return { success: true };
    }),
});
