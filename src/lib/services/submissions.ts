import { listSeedCategories } from "@/lib/catalog/seed-catalog";
import { requireAdminUser } from "@/lib/auth/admin";
import {
  getCategoryBySlug,
  listCategories,
} from "@/lib/repositories/categories";
import {
  getSiteBySlug,
  getSiteByUrl,
  insertSite,
} from "@/lib/repositories/sites";
import { buildSearchText } from "@/lib/services/search-text";
import { slugify } from "@/lib/utils/slugify";
import {
  getPendingOrApprovedSubmissionByUrl,
  getSubmissionById,
  insertSubmission,
  listPendingSubmissions,
  updateSubmissionStatus,
} from "@/lib/repositories/submissions";
import { normalizeUrl } from "@/lib/utils/url";
import {
  submissionFormSchema,
  type SubmissionFormInput,
} from "@/lib/validators/submission";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

async function resolveCategorySlug(slug: string): Promise<string | null> {
  try {
    const categories = await listCategories();
    if (categories.some((category) => category.slug === slug)) {
      return slug;
    }
  } catch {
    // fall through
  }

  return listSeedCategories().some((category) => category.slug === slug)
    ? slug
    : null;
}

export async function createPublicSubmission(raw: unknown): Promise<{ id: string }> {
  const input: SubmissionFormInput = submissionFormSchema.parse(raw);

  if (input.website) {
    // Honeypot filled, pretend success.
    return { id: "ignored" };
  }

  const categorySlug = await resolveCategorySlug(input.categorySlug);
  if (!categorySlug) {
    throw new Error("Invalid category");
  }

  const url = normalizeUrl(input.url);

  try {
    const existingSite = await getSiteByUrl(url);
    if (existingSite) {
      if (existingSite.status === "published") {
        throw new Error(
          `That site is already in the catalog (/site/${existingSite.slug}).`,
        );
      }
      throw new Error("That URL is already in the catalog.");
    }

    const existingSubmission = await getPendingOrApprovedSubmissionByUrl(url);
    if (existingSubmission?.status === "pending") {
      throw new Error("That URL was already submitted and is waiting for review.");
    }
    if (existingSubmission?.status === "approved") {
      throw new Error("That URL was already submitted and approved.");
    }

    const row = await insertSubmission({
      name: input.name,
      url,
      description: input.description,
      categorySlug,
      tags: parseTags(input.tags ?? ""),
      submitterEmail: input.submitterEmail || null,
      status: "pending",
    });
    return { id: row.id };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      if (
        message === "Invalid category" ||
        message.startsWith("That site is already") ||
        message.startsWith("That URL")
      ) {
        throw error;
      }
    }
    console.error("Submission insert failed:", error);
    throw new Error(
      "Could not save submission. Database may not be migrated yet, try again after setup.",
    );
  }
}

export async function listSubmissionsForAdmin() {
  await requireAdminUser();
  return listPendingSubmissions();
}

export async function rejectSubmissionAsAdmin(id: string, notes?: string) {
  await requireAdminUser();
  const existing = await getSubmissionById(id);
  if (!existing) {
    throw new Error("Submission not found");
  }
  return updateSubmissionStatus(id, "rejected", notes);
}

/** First free slug for a name: `figma`, then `figma-2`, `figma-3`, … */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "site";
  for (let suffix = 1; suffix < 50; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const taken = await getSiteBySlug(candidate);
    if (!taken) {
      return candidate;
    }
  }
  return `${base}-${Date.now()}`;
}

export type ApprovalResult = {
  siteId: string;
  /** false when the URL was already in the catalog and we just linked to it. */
  created: boolean;
};

/**
 * Approving is a publish step, not a sticky note.
 *
 * It carries everything the submitter typed into a real draft site and hands
 * back its id, so the admin lands on the edit form with the work already done
 * and only has to add pros, cons, and a score before publishing.
 */
export async function approveSubmissionAsAdmin(
  id: string,
  notes?: string,
): Promise<ApprovalResult> {
  await requireAdminUser();
  const submission = await getSubmissionById(id);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const url = normalizeUrl(submission.url);

  // Already in the catalog, mark it reviewed and point at what exists.
  const existingSite = await getSiteByUrl(url);
  if (existingSite) {
    await updateSubmissionStatus(id, "approved", notes);
    return { siteId: existingSite.id, created: false };
  }

  if (!submission.categorySlug) {
    throw new Error(
      "This submission has no category. Set one on the site form instead.",
    );
  }

  const category = await getCategoryBySlug(submission.categorySlug);
  if (!category) {
    throw new Error(
      `Category "${submission.categorySlug}" does not exist in the database yet. Seed or create it first.`,
    );
  }

  const site = await insertSite({
    name: submission.name,
    slug: await uniqueSlug(submission.name),
    url,
    description: submission.description,
    categoryId: category.id,
    // Neutral starting points, the admin sets the real ones before publishing.
    pricing: "freemium",
    rating: "4.0",
    tags: submission.tags,
    pros: [],
    cons: [],
    status: "draft",
    searchText: buildSearchText({
      name: submission.name,
      description: submission.description,
      categoryName: category.name,
      tags: submission.tags,
      pros: [],
    }),
  });

  await updateSubmissionStatus(id, "approved", notes);
  return { siteId: site.id, created: true };
}
