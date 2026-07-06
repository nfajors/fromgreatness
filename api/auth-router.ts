import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  buildSessionCookie,
  buildLogoutCookie,
} from "./lib/session-helper";
import { hashPassword, verifyPassword } from "./lib/password";
import {
  findUserByEmail,
  createPasswordUser,
} from "./queries/users";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

const emailSchema = z.string().email().max(320);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200);

export const authRouter = createRouter({
  // Current user (null if unauthenticated handled by client via error)
  me: authedQuery.query((opts) => opts.ctx.user),

  // ─── Register a new parent account ───
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(255),
        email: emailSchema,
        password: passwordSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createPasswordUser({
        email: input.email,
        name: input.name,
        passwordHash,
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account.",
        });
      }

      ctx.resHeaders.append(
        "set-cookie",
        await buildSessionCookie(user.unionId, ctx.req.headers),
      );

      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),

  // ─── Login with email + password ───
  login: publicQuery
    .input(
      z.object({
        email: emailSchema,
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      // Generic error to avoid leaking which emails exist.
      const invalid = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password.",
      });
      if (!user || !user.passwordHash) throw invalid;

      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) throw invalid;

      await getDb()
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      ctx.resHeaders.append(
        "set-cookie",
        await buildSessionCookie(user.unionId, ctx.req.headers),
      );

      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),

  // ─── Logout ───
  logout: publicQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      buildLogoutCookie(ctx.req.headers),
    );
    return { success: true };
  }),

  // ─── Change password (authenticated) ───
  changePassword: authedQuery
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: passwordSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;
      const ok = await verifyPassword(input.currentPassword, user.passwordHash);
      if (!ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect.",
        });
      }
      const passwordHash = await hashPassword(input.newPassword);
      await getDb()
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, user.id));
      return { success: true };
    }),

  // ─── Update basic profile fields (name, email, avatar) ───
  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        email: emailSchema.optional(),
        avatar: z.string().max(2_000_000).optional(), // data URL or hosted URL
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.email !== undefined) updates.email = input.email.toLowerCase().trim();
      if (input.avatar !== undefined) updates.avatar = input.avatar;
      if (Object.keys(updates).length === 0) return { success: true };

      await getDb()
        .update(users)
        .set(updates)
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
