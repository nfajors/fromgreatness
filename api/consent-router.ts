import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { parentalConsents } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Bump this when the consent language changes; parents are re-prompted when
// their latest recorded version is older than the current one.
export const CURRENT_CONSENT_VERSION = "2026-07-v1";

export const consentRouter = createRouter({
  // Record a parent's consent — the COPPA audit trail.
  record: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        guardianName: z.string().min(1).max(255),
        dataCollection: z.boolean(),
        communication: z.boolean(),
        photoVideo: z.boolean().optional(),
        terms: z.boolean(),
        signatureProvided: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await getDb().insert(parentalConsents).values({
        parentId: ctx.user.id,
        studentId: input.studentId,
        guardianName: input.guardianName,
        consentDataCollection: input.dataCollection,
        consentCommunication: input.communication,
        consentPhotoVideo: input.photoVideo ?? false,
        consentTerms: input.terms,
        consentTextVersion: CURRENT_CONSENT_VERSION,
        signatureProvided: input.signatureProvided ?? false,
        ipAddress: ctx.ipAddress ?? null,
      });
      return { success: true, version: CURRENT_CONSENT_VERSION };
    }),

  // Whether the current parent has a valid, current-version consent on file.
  status: authedQuery.query(async ({ ctx }) => {
    const latest = await getDb().query.parentalConsents.findFirst({
      where: eq(parentalConsents.parentId, ctx.user.id),
      orderBy: [desc(parentalConsents.createdAt)],
    });
    return {
      hasConsent: !!latest,
      isCurrent: latest?.consentTextVersion === CURRENT_CONSENT_VERSION,
      recordedAt: latest?.createdAt ?? null,
      version: latest?.consentTextVersion ?? null,
    };
  }),
});
