import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type UserRow = typeof users.$inferSelect;

export async function upsertGoogleUser(input: {
  googleSub: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<UserRow> {
  const now = new Date();
  const rows = await getDb()
    .insert(users)
    .values({
      googleSub: input.googleSub,
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
      lastSeenAt: now,
    })
    .onConflictDoUpdate({
      target: users.googleSub,
      set: {
        email: input.email,
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
        lastSeenAt: now,
      },
    })
    .returning();

  return rows[0]!;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}
