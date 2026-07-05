import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  studyPlans,
  studyModules,
  students,
  dnaResults,
  assessments,
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import { aiEnabled } from "./lib/env";
import { generateModulesWithAI, type GenModule } from "./lib/ai-content";

// Static fallback library mirrors the AI output shape so the app produces real
// plans even without an Anthropic key configured.
const FALLBACK: Record<string, GenModule[]> = {
  history: [
    {
      title: "Origins of West African Civilization",
      description:
        "Discover the ancient kingdoms and empires that shaped West Africa.",
      lessons: [
        { title: "Introduction to African Civilizations", type: "video", duration: 15 },
        { title: "The Nok Culture", type: "reading", duration: 20 },
        { title: "The Ghana Empire: Land of Gold", type: "video", duration: 18 },
        { title: "Quiz: Early African Kingdoms", type: "quiz", duration: 10 },
        { title: "Activity: Create a Timeline", type: "activity", duration: 15 },
      ],
    },
    {
      title: "The Mali Empire & Mansa Musa",
      description: "Journey through the golden age of the Mali Empire.",
      lessons: [
        { title: "Rise of the Mali Empire", type: "video", duration: 15 },
        { title: "Mansa Musa's Pilgrimage", type: "reading", duration: 25 },
        { title: "Quiz: The Mali Empire", type: "quiz", duration: 10 },
      ],
    },
  ],
  language: [
    {
      title: "Introduction to Swahili",
      description: "Begin your journey with Swahili.",
      lessons: [
        { title: "Alphabet & Pronunciation", type: "video", duration: 15 },
        { title: "Greetings: Jambo!", type: "reading", duration: 20 },
        { title: "Numbers 1-20", type: "quiz", duration: 15 },
        { title: "Activity: Practice Greetings", type: "activity", duration: 15 },
      ],
    },
  ],
  food: [
    {
      title: "Traditional Dishes & Their Stories",
      description: "Explore the cultural significance behind heritage recipes.",
      lessons: [
        { title: "Jollof Rice", type: "video", duration: 20 },
        { title: "Cooking Activity: Make Jollof", type: "activity", duration: 45 },
        { title: "Quiz: African Cuisine", type: "quiz", duration: 10 },
      ],
    },
  ],
  dress: [
    {
      title: "Traditional Garments & Their Meanings",
      description: "Learn the cultural significance of traditional clothing.",
      lessons: [
        { title: "Kente Cloth: Patterns of Wisdom", type: "video", duration: 18 },
        { title: "Beadwork and Adornment", type: "video", duration: 15 },
        { title: "Activity: Design Your Own Pattern", type: "activity", duration: 30 },
      ],
    },
  ],
};

export const studyPlanRouter = createRouter({
  listByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const plans = await getDb().query.studyPlans.findMany({
        where: eq(studyPlans.studentId, input.studentId),
        with: { modules: true },
      });
      return plans;
    }),

  listByDomain: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        domain: z.enum(["history", "language", "food", "dress"]),
      }),
    )
    .query(async ({ input }) => {
      return getDb().query.studyPlans.findMany({
        where: and(
          eq(studyPlans.studentId, input.studentId),
          eq(studyPlans.domain, input.domain),
        ),
        with: { modules: true },
      });
    }),

  // ─── Generate & persist AI-personalized study plans for a student ───
  generate: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        domains: z
          .array(z.enum(["history", "language", "food", "dress"]))
          .optional(),
        intensity: z.enum(["low", "medium", "high"]).optional(),
        regenerate: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const targetDomains =
        input.domains ?? (["history", "language", "food", "dress"] as const);
      const intensity = input.intensity ?? "medium";

      // Gather personalization context.
      const student = await getDb().query.students.findFirst({
        where: eq(students.id, input.studentId),
      });
      const dnaData = await getDb().query.dnaResults.findFirst({
        where: eq(dnaResults.studentId, input.studentId),
      });
      const studentAssessments = await getDb().query.assessments.findMany({
        where: eq(assessments.studentId, input.studentId),
      });
      const traits =
        studentAssessments.find((a) => a.type === "personality")?.traits ?? [
          "Curious",
          "Creative",
          "Determined",
        ];
      const heritageRegions =
        dnaData?.ancestrySummary?.map((r) => ({
          region: r.region,
          percentage: r.percentage,
        })) ?? [];

      const createdPlans = [];

      for (const domain of targetDomains) {
        // If a plan already exists for this domain and we're not regenerating,
        // skip to avoid duplicates.
        const existing = await getDb().query.studyPlans.findMany({
          where: and(
            eq(studyPlans.studentId, input.studentId),
            eq(studyPlans.domain, domain),
          ),
        });
        if (existing.length > 0 && !input.regenerate) {
          continue;
        }
        if (existing.length > 0 && input.regenerate) {
          for (const p of existing) {
            await getDb()
              .delete(studyModules)
              .where(eq(studyModules.planId, p.id));
            await getDb().delete(studyPlans).where(eq(studyPlans.id, p.id));
          }
        }

        // Produce modules via AI, falling back to the static library.
        let modules: GenModule[] = [];
        if (aiEnabled && student) {
          try {
            modules = await generateModulesWithAI({
              domain,
              studentAge: student.age,
              selfReportedIdentity: student.ethnicitySelfReported,
              heritageRegions,
              traits,
              intensity,
            });
          } catch (err) {
            console.warn(`[ai] ${domain} generation failed, using fallback:`, err);
          }
        }
        if (!modules.length) modules = FALLBACK[domain] ?? [];
        if (!modules.length) continue;

        const primary = heritageRegions[0]?.region;
        const planResult = await getDb()
          .insert(studyPlans)
          .values({
            studentId: input.studentId,
            domain,
            title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Heritage Program`,
            description: primary
              ? `A personalized ${domain} curriculum aligned with your ${primary} heritage.`
              : `A personalized ${domain} curriculum.`,
            intensityLevel: intensity,
            startDate: new Date(),
          });
        const planId = Number(planResult[0].insertId);

        // Persist each module with lessons.
        for (let i = 0; i < modules.length; i++) {
          const m = modules[i];
          const lessons = m.lessons.map((l, li) => ({
            id: `lesson-${i}-${li}`,
            title: l.title,
            type: l.type,
            duration: l.duration,
            completed: false,
            content: l.content,
          }));
          await getDb()
            .insert(studyModules)
            .values({
              planId,
              studentId: input.studentId,
              title: m.title,
              description: m.description,
              domain,
              orderIndex: i,
              duration: m.lessons.reduce((s, l) => s + l.duration, 0),
              difficulty:
                i === 0 ? "beginner" : i === 1 ? "intermediate" : "advanced",
              lessons,
              status: i === 0 ? "unlocked" : "locked",
            });
        }

        const plan = await getDb().query.studyPlans.findFirst({
          where: eq(studyPlans.id, planId),
          with: { modules: true },
        });
        if (plan) createdPlans.push(plan);
      }

      return {
        generatedBy: aiEnabled ? ("ai" as const) : ("template" as const),
        plans: createdPlans,
      };
    }),

  createPlan: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        domain: z.enum(["history", "language", "food", "dress"]),
        title: z.string().min(1),
        description: z.string().optional(),
        intensityLevel: z.enum(["low", "medium", "high"]).default("medium"),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await getDb()
        .insert(studyPlans)
        .values({
          studentId: input.studentId,
          domain: input.domain,
          title: input.title,
          description: input.description,
          intensityLevel: input.intensityLevel,
          startDate: new Date(),
        });
      const id = Number(result[0].insertId);
      return getDb().query.studyPlans.findFirst({
        where: eq(studyPlans.id, id),
        with: { modules: true },
      });
    }),

  updateProgress: authedQuery
    .input(
      z.object({
        id: z.number(),
        overallProgress: z.number().min(0).max(100),
        status: z.enum(["active", "completed", "paused"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(studyPlans).set(data).where(eq(studyPlans.id, id));
      return getDb().query.studyPlans.findFirst({
        where: eq(studyPlans.id, id),
        with: { modules: true },
      });
    }),

  // ─── Modules ───
  listModules: authedQuery
    .input(
      z.object({
        planId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return getDb().query.studyModules.findMany({
        where: eq(studyModules.planId, input.planId),
      });
    }),

  createModule: authedQuery
    .input(
      z.object({
        planId: z.number(),
        studentId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        domain: z.enum(["history", "language", "food", "dress"]),
        orderIndex: z.number(),
        duration: z.number(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        lessons: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              type: z.enum(["video", "reading", "quiz", "activity"]),
              duration: z.number(),
              completed: z.boolean().default(false),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await getDb()
        .insert(studyModules)
        .values({
          planId: input.planId,
          studentId: input.studentId,
          title: input.title,
          description: input.description,
          domain: input.domain,
          orderIndex: input.orderIndex,
          duration: input.duration,
          difficulty: input.difficulty,
          lessons: input.lessons,
          status: "unlocked",
        });
      const id = Number(result[0].insertId);
      return getDb().query.studyModules.findFirst({
        where: eq(studyModules.id, id),
      });
    }),

  updateModuleStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["locked", "unlocked", "in_progress", "completed"]),
      }),
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(studyModules)
        .set({ status: input.status })
        .where(eq(studyModules.id, input.id));
      return getDb().query.studyModules.findFirst({
        where: eq(studyModules.id, input.id),
      });
    }),
});
