import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

/**
 * Create a new email/password user. unionId is derived as "email:<address>".
 * Returns the created user row.
 */
export async function createPasswordUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const email = data.email.toLowerCase().trim();
  const unionId = `email:${email}`;
  const role = unionId === env.ownerUnionId || email === env.ownerUnionId
    ? "admin"
    : "user";

  await getDb().insert(schema.users).values({
    unionId,
    email,
    name: data.name,
    passwordHash: data.passwordHash,
    authProvider: "password",
    role,
  });

  return findUserByUnionId(unionId);
}

export async function setUserStripeCustomerId(userId: number, customerId: string) {
  await getDb()
    .update(schema.users)
    .set({ stripeCustomerId: customerId })
    .where(eq(schema.users.id, userId));
}

/**
 * Upsert used by OAuth providers (Kimi, Google, Apple) keyed by unionId.
 */
export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}
