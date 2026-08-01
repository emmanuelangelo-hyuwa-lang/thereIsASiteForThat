import { asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export async function listCategories() {
  return getDb().select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryById(id: string) {
  const rows = await getDb()
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
