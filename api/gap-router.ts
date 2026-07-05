import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { gapAnalyses, dnaResults } from "@db/schema";
import { eq } from "drizzle-orm";

function generateGapAnalysis(
  studentId: number,
  ancestryData: Array<{ region: string; percentage: number }> | null,
) {
  const domains = ["history", "language", "food", "dress"] as const;
  const existingIdentity: Record<string, number> = {};
  const geneticProfile: Record<string, number> = {};
  const domainGaps: Array<{
    domain: string;
    currentLevel: number;
    heritageLevel: number;
    gap: number;
    priority: "high" | "medium" | "low";
  }> = [];
  let totalGap = 0;

  const baseHeritage =
    ancestryData && ancestryData.length > 0 ? ancestryData[0].percentage : 50;

  domains.forEach((domain, idx) => {
    // Deterministic per-(student, domain) variation instead of Math.random(),
    // so the analysis is stable when the parent revisits it.
    const seed = (studentId * 17 + idx * 23) % 35;
    existingIdentity[domain] = Math.max(8, 12 + seed);
    geneticProfile[domain] = Math.min(
      95,
      Math.floor(baseHeritage * 0.8) + 10 + ((studentId * 7 + idx * 11) % 15),
    );
    const gap = Math.round(geneticProfile[domain] - existingIdentity[domain]);
    totalGap += gap;

    domainGaps.push({
      domain,
      currentLevel: existingIdentity[domain],
      heritageLevel: geneticProfile[domain],
      gap,
      priority:
        gap > 40 ? ("high" as const) : gap > 20 ? ("medium" as const) : ("low" as const),
    });
  });

  const primaryRegion = ancestryData?.[0]?.region ?? "your heritage";
  const insights = [
    {
      title:
        domainGaps[0].gap > 40
          ? "Cultural history is your biggest opportunity"
          : "Strong foundation in cultural history",
      description: `Current engagement at ${existingIdentity["history"]}% vs recommended ${geneticProfile["history"]}%. Focus on ${primaryRegion} history to build a 1,000-year perspective.`,
      priority: domainGaps[0].gap > 40 ? ("high" as const) : ("low" as const),
      domain: "history",
    },
    {
      title:
        domainGaps[1].gap > 40
          ? "Heritage language exposure needs attention"
          : "Language engagement is on track",
      description: `Heritage language learning at ${existingIdentity["language"]}% vs recommended ${geneticProfile["language"]}%. Language modules tied to ${primaryRegion} are recommended.`,
      priority: domainGaps[1].gap > 40 ? ("high" as const) : ("low" as const),
      domain: "language",
    },
    {
      title: "Food traditions show strong connection",
      description: `Food cultural practices at ${existingIdentity["food"]}% vs recommended ${geneticProfile["food"]}%. Continue building with ${primaryRegion} recipes and nutrition education.`,
      priority: "low" as const,
      domain: "food",
    },
  ];

  return {
    gapScore: Math.round(totalGap / domains.length),
    existingIdentity,
    geneticProfile,
    domainGaps,
    keyInsights: insights,
  };
}

export const gapRouter = createRouter({
  getByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.gapAnalyses.findFirst({
        where: eq(gapAnalyses.studentId, input.studentId),
      });
    }),

  generate: authedQuery
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ input }) => {
      // Check if DNA data exists
      const dnaData = await getDb().query.dnaResults.findFirst({
        where: eq(dnaResults.studentId, input.studentId),
      });

      const ancestrySummary = dnaData?.ancestrySummary ?? null;
      const generated = generateGapAnalysis(input.studentId, ancestrySummary);

      // Delete existing analysis
      await getDb()
        .delete(gapAnalyses)
        .where(eq(gapAnalyses.studentId, input.studentId));

      const result = await getDb()
        .insert(gapAnalyses)
        .values({
          studentId: input.studentId,
          gapScore: generated.gapScore.toString(),
          existingIdentity: generated.existingIdentity,
          geneticProfile: generated.geneticProfile,
          domainGaps: generated.domainGaps,
          keyInsights: generated.keyInsights,
        });
      const id = Number(result[0].insertId);

      return getDb().query.gapAnalyses.findFirst({
        where: eq(gapAnalyses.id, id),
      });
    }),
});
