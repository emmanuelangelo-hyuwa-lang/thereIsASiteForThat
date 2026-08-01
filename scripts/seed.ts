import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { SEED_CATEGORIES } from "../src/data/seed/categories";
import { SEED_COLLECTIONS } from "../src/data/seed/collections";
import { SEED_SITES } from "../src/data/seed/sites";
import { getDb } from "../src/lib/db";
import {
  categories,
  collectionSites,
  collections,
  sites,
} from "../src/lib/db/schema";
import { buildSearchText } from "../src/lib/services/search-text";
import { normalizeUrl } from "../src/lib/utils/url";

config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Copy .env.example to .env.local first.");
  }

  const db = getDb();
  console.log(`Seeding ${SEED_CATEGORIES.length} categories…`);

  for (const category of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          description: category.description,
        },
      });
  }

  const categoryRows = await db.select().from(categories);
  const categoryIdBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]));

  console.log(`Seeding ${SEED_SITES.length} sites…`);

  for (const site of SEED_SITES) {
    const categoryId = categoryIdBySlug.get(site.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for site ${site.slug}: ${site.categorySlug}`);
    }

    const categoryName =
      categoryRows.find((row) => row.id === categoryId)?.name ?? site.categorySlug;
    const searchText = buildSearchText({
      name: site.name,
      description: site.description,
      categoryName,
      tags: site.tags,
      pros: site.pros,
    });

    await db
      .insert(sites)
      .values({
        name: site.name,
        slug: site.slug,
        url: normalizeUrl(site.url),
        description: site.description,
        categoryId,
        pricing: site.pricing,
        rating: site.rating.toFixed(1),
        tags: site.tags,
        pros: site.pros,
        cons: site.cons,
        status: "published",
        searchText,
        publishedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: sites.slug,
        set: {
          name: site.name,
          url: normalizeUrl(site.url),
          description: site.description,
          categoryId,
          pricing: site.pricing,
          rating: site.rating.toFixed(1),
          tags: site.tags,
          pros: site.pros,
          cons: site.cons,
          status: "published",
          searchText,
          updatedAt: new Date(),
          publishedAt: new Date(),
        },
      });
  }

  const siteRows = await db.select({ id: sites.id, slug: sites.slug }).from(sites);
  const siteIdBySlug = new Map(siteRows.map((row) => [row.slug, row.id]));

  console.log(`Seeding ${SEED_COLLECTIONS.length} collections…`);

  for (const collection of SEED_COLLECTIONS) {
    await db
      .insert(collections)
      .values({
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
      })
      .onConflictDoUpdate({
        target: collections.slug,
        set: {
          name: collection.name,
          description: collection.description,
        },
      });

    const [collectionRow] = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, collection.slug))
      .limit(1);

    if (!collectionRow) {
      throw new Error(`Collection missing after upsert: ${collection.slug}`);
    }

    await db
      .delete(collectionSites)
      .where(eq(collectionSites.collectionId, collectionRow.id));

    const values = collection.siteSlugs
      .map((slug, position) => {
        const siteId = siteIdBySlug.get(slug);
        if (!siteId) {
          console.warn(`Skipping missing site slug in collection ${collection.slug}: ${slug}`);
          return null;
        }
        return {
          collectionId: collectionRow.id,
          siteId,
          position,
        };
      })
      .filter((value): value is NonNullable<typeof value> => value !== null);

    if (values.length > 0) {
      await db.insert(collectionSites).values(values);
    }
  }

  console.log("Seed complete.");
  console.log("Next: npm run db:embed  (requires OPENAI_API_KEY)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
