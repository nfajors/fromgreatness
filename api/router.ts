import { authRouter } from "./auth-router";
import { studentRouter } from "./student-router";
import { assessmentRouter } from "./assessment-router";
import { dnaRouter } from "./dna-router";
import { gapRouter } from "./gap-router";
import { studyPlanRouter } from "./study-plan-router";
import { progressRouter } from "./progress-router";
import { parentActionRouter } from "./parent-action-router";
import { achievementRouter } from "./achievement-router";
import { subscriptionRouter } from "./subscription-router";
import { aiRouter } from "./ai-router";
import { activityRouter } from "./activity-router";
import { consentRouter } from "./consent-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  student: studentRouter,
  assessment: assessmentRouter,
  dna: dnaRouter,
  gap: gapRouter,
  studyPlan: studyPlanRouter,
  progress: progressRouter,
  parentAction: parentActionRouter,
  achievement: achievementRouter,
  subscription: subscriptionRouter,
  ai: aiRouter,
  activity: activityRouter,
  consent: consentRouter,
});

export type AppRouter = typeof appRouter;
