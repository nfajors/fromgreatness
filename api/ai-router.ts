import { z } from "zod";
import { createRouter, authedQuery, subscribedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { assessments, dnaResults, students } from "@db/schema";
import { eq } from "drizzle-orm";
import { aiEnabled } from "./lib/env";
import { generateModulesWithAI, type GenModule } from "./lib/ai-content";

// ─── AI-Powered Study Plan Generation ───

const MODULE_TEMPLATES: Record<string, Array<{ title: string; description: string; lessons: Array<{ title: string; type: "video" | "reading" | "quiz" | "activity"; duration: number; content?: string }> }>> = {
  history: [
    {
      title: "Origins of West African Civilization",
      description: "Discover the ancient kingdoms and empires that shaped West Africa, from the Nok culture to the Ghana Empire.",
      lessons: [
        { title: "Introduction to African Civilizations", type: "video", duration: 15, content: "Explore the rich tapestry of African civilizations that flourished for thousands of years before European contact." },
        { title: "The Nok Culture: Africa's First Civilization", type: "reading", duration: 20, content: "Learn about the Nok people of Nigeria, who created sophisticated terracotta sculptures as early as 1000 BCE." },
        { title: "The Ghana Empire: Land of Gold", type: "video", duration: 18, content: "Discover how the Ghana Empire became one of the most powerful trading nations in medieval Africa." },
        { title: "Quiz: Early African Kingdoms", type: "quiz", duration: 10 },
        { title: "Activity: Create a Timeline", type: "activity", duration: 15, content: "Create a visual timeline of the rise and fall of the Ghana Empire with key events and figures." },
      ],
    },
    {
      title: "The Mali Empire & Mansa Musa",
      description: "Journey through the golden age of the Mali Empire and the legendary pilgrimage of Mansa Musa.",
      lessons: [
        { title: "Rise of the Mali Empire", type: "video", duration: 15 },
        { title: "Mansa Musa's Golden Pilgrimage", type: "reading", duration: 25 },
        { title: "Timbuktu: Center of Learning", type: "video", duration: 20 },
        { title: "Quiz: The Mali Empire", type: "quiz", duration: 10 },
      ],
    },
    {
      title: "Transatlantic Connections",
      description: "Understand the historical connections between Africa and the Americas through the transatlantic experience.",
      lessons: [
        { title: "The Middle Passage", type: "video", duration: 20 },
        { title: "Resistance and Resilience", type: "reading", duration: 25 },
        { title: "Cultural Retentions in the Americas", type: "video", duration: 18 },
        { title: "Quiz: Transatlantic History", type: "quiz", duration: 10 },
      ],
    },
  ],
  language: [
    {
      title: "Introduction to Swahili",
      description: "Begin your journey with Swahili, one of Africa's most widely spoken languages with rich cultural roots.",
      lessons: [
        { title: "Swahili Alphabet & Pronunciation", type: "video", duration: 15 },
        { title: "Greetings: Jambo! Habari!", type: "reading", duration: 20 },
        { title: "Numbers 1-20", type: "quiz", duration: 15 },
        { title: "Common Phrases", type: "video", duration: 18 },
        { title: "Activity: Practice Greetings", type: "activity", duration: 15 },
      ],
    },
    {
      title: "Family & Community Terms",
      description: "Learn the essential vocabulary for family relationships and community interactions in heritage languages.",
      lessons: [
        { title: "Family Members", type: "video", duration: 15 },
        { title: "Community Roles", type: "reading", duration: 20 },
        { title: "Quiz: Family Vocabulary", type: "quiz", duration: 10 },
      ],
    },
  ],
  food: [
    {
      title: "Traditional Dishes & Their Stories",
      description: "Explore the cultural significance behind traditional recipes and their connection to heritage.",
      lessons: [
        { title: "Jollof Rice: A West African Classic", type: "video", duration: 20 },
        { title: "Injera and Ethiopian Cuisine", type: "reading", duration: 20 },
        { title: "Cooking Activity: Make Jollof Rice", type: "activity", duration: 45 },
        { title: "Quiz: African Cuisine", type: "quiz", duration: 10 },
      ],
    },
    {
      title: "Nutrition & Heritage Foods",
      description: "Discover how traditional foods promote health and connect us to ancestral wisdom.",
      lessons: [
        { title: "Superfoods from Africa", type: "video", duration: 15 },
        { title: "Traditional Cooking Methods", type: "reading", duration: 20 },
        { title: "Activity: Family Recipe Collection", type: "activity", duration: 30 },
      ],
    },
  ],
  dress: [
    {
      title: "Traditional Garments & Their Meanings",
      description: "Learn about the cultural significance of traditional clothing and textile patterns.",
      lessons: [
        { title: "Kente Cloth: Patterns of Wisdom", type: "video", duration: 18 },
        { title: "Dashikis and Boubous", type: "reading", duration: 20 },
        { title: "Beadwork and Adornment", type: "video", duration: 15 },
        { title: "Quiz: Traditional Dress", type: "quiz", duration: 10 },
      ],
    },
    {
      title: "Modern Cultural Fashion",
      description: "Explore how traditional designs influence contemporary fashion across the diaspora.",
      lessons: [
        { title: "Afrofuturism in Fashion", type: "video", duration: 15 },
        { title: "Activity: Design Your Own Pattern", type: "activity", duration: 30 },
      ],
    },
  ],
};

export const aiRouter = createRouter({
  // ─── Generate Gap Analysis ───
  analyze: subscribedQuery
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ input }) => {
      // Fetch assessment data
      const studentAssessments = await getDb().query.assessments.findMany({
        where: eq(assessments.studentId, input.studentId),
      });

      // Fetch DNA data
      const dnaData = await getDb().query.dnaResults.findFirst({
        where: eq(dnaResults.studentId, input.studentId),
      });

      // Calculate personality traits
      const personalityAssessment = studentAssessments.find(
        (a) => a.type === "personality",
      );
      const traits = personalityAssessment?.traits ?? [
        "Curious",
        "Creative",
        "Determined",
      ];

      // Use DNA ancestry for gap analysis
      const ancestryRegions = dnaData?.ancestrySummary ?? [
        { region: "West African", percentage: 45, color: "#00C853" },
        { region: "European", percentage: 25, color: "#38BDF8" },
        { region: "Native American", percentage: 15, color: "#F59E0B" },
        { region: "East African", percentage: 10, color: "#7E57C2" },
        { region: "Other", percentage: 5, color: "#64748B" },
      ];

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

      // Use assessment scores to seed current identity levels
      const assessmentScores = studentAssessments.reduce(
        (acc, a) => {
          if (a.score) acc[a.type] = a.score;
          return acc;
        },
        {} as Record<string, number>,
      );

      const baseScore = assessmentScores["personality"]
        ? Math.min(100, assessmentScores["personality"] * 5)
        : 30;

      for (const domain of domains) {
        // Deterministic per-(student,domain) variation instead of Math.random(),
        // so gap analysis is stable across reloads.
        const seed = (input.studentId * 31 + domain.length * 7) % 50;
        existingIdentity[domain] = Math.max(
          5,
          Math.floor(baseScore * (0.5 + (seed / 100))),
        );
        const primaryPct = ancestryRegions[0]?.percentage ?? 50;
        geneticProfile[domain] = Math.min(95, Math.floor(primaryPct * 0.9 + 15));
        const gap = Math.round(geneticProfile[domain] - existingIdentity[domain]);
        domainGaps.push({
          domain,
          currentLevel: existingIdentity[domain],
          heritageLevel: geneticProfile[domain],
          gap,
          priority: gap > 40 ? "high" : gap > 20 ? "medium" : "low",
        });
      }

      const totalGap = domainGaps.reduce((s, d) => s + d.gap, 0);

      const insights: Array<{
        title: string;
        description: string;
        priority: "high" | "medium" | "low";
        domain: string;
      }> = domainGaps.map((dg) => ({
        title:
          dg.priority === "high"
            ? `${dg.domain.charAt(0).toUpperCase() + dg.domain.slice(1)} gap needs attention`
            : `${dg.domain.charAt(0).toUpperCase() + dg.domain.slice(1)} connection is strong`,
        description: `Current ${dg.domain} engagement at ${dg.currentLevel}% vs heritage recommended ${dg.heritageLevel}%. ${
          dg.priority === "high"
            ? "Priority focus area for cultural development."
            : "Good foundation — continue building."
        }`,
        priority: dg.priority,
        domain: dg.domain,
      }));

      return {
        gapScore: Math.round(totalGap / domains.length),
        existingIdentity,
        geneticProfile,
        domainGaps,
        keyInsights: insights,
        traits,
        primaryAncestry: ancestryRegions[0]?.region ?? "Unknown",
      };
    }),

  // ─── Generate Study Plans (AI-personalized, template fallback) ───
  generateStudyPlans: subscribedQuery
    .input(
      z.object({
        studentId: z.number(),
        domains: z
          .array(z.enum(["history", "language", "food", "dress"]))
          .optional(),
        intensity: z.enum(["low", "medium", "high"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const targetDomains = input.domains ?? [
        "history",
        "language",
        "food",
        "dress",
      ];
      const intensity = input.intensity ?? "medium";

      // Gather the student context that personalizes generation.
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
        studentAssessments.find((a) => a.type === "personality")?.traits ??
        ["Curious", "Creative", "Determined"];
      const heritageRegions =
        dnaData?.ancestrySummary?.map((r) => ({
          region: r.region,
          percentage: r.percentage,
        })) ?? [];

      const generatedPlans = [];

      for (const domain of targetDomains) {
        let modules: GenModule[];

        // Try AI first; fall back to the static template library on any failure.
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
            if (!modules.length) throw new Error("empty AI result");
          } catch (err) {
            console.warn(
              `[ai] generation failed for ${domain}, using template:`,
              err,
            );
            modules = MODULE_TEMPLATES[domain] ?? [];
          }
        } else {
          modules = MODULE_TEMPLATES[domain] ?? [];
        }

        const plan = {
          domain,
          title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Heritage Program`,
          description: `A personalized ${domain} curriculum aligned with ${
            heritageRegions[0]?.region ?? "your"
          } heritage.`,
          generatedBy: aiEnabled ? ("ai" as const) : ("template" as const),
          modules: modules.map((t, i) => ({
            ...t,
            orderIndex: i,
            duration: t.lessons.reduce((s, l) => s + l.duration, 0),
            difficulty:
              i === 0 ? "beginner" : i === 1 ? "intermediate" : "advanced",
            status: i === 0 ? "unlocked" : "locked",
            lessons: t.lessons.map((l, li) => ({ ...l, id: `lesson-${i}-${li}` })),
          })),
        };
        generatedPlans.push(plan);
      }

      return generatedPlans;
    }),

  // ─── Generate Parent Action Suggestions ───
  suggestParentActions: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const studentAssessments = await getDb().query.assessments.findMany({
        where: eq(assessments.studentId, input.studentId),
      });

      const actions = [];
      const pendingAssessments = studentAssessments.filter(
        (a) => a.status !== "completed",
      );

      if (pendingAssessments.length > 0) {
        for (const pa of pendingAssessments) {
          actions.push({
            actionType: "assessment_complete" as const,
            title: `Complete ${pa.type.replace("_", " ")} assessment`,
            description: `Your child has a pending ${pa.type} assessment. Encourage them to complete it for more personalized study plans.`,
            gamificationPoints: 25,
          });
        }
      }

      // Add general encouragement actions
      actions.push({
        actionType: "study_reminder" as const,
        title: "Set up daily study time",
        description:
          "Establish a consistent 20-30 minute daily study routine for heritage learning.",
        gamificationPoints: 10,
      });

      actions.push({
        actionType: "progress_report" as const,
        title: "Review this week's progress",
        description:
          "Check your child's learning dashboard and celebrate their achievements.",
        gamificationPoints: 15,
      });

      return actions;
    }),
});
