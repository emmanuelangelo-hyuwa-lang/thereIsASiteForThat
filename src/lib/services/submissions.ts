import { listSeedCategories } from "@/lib/catalog/seed-catalog";
import { requireAdminUser } from "@/lib/auth/admin";
import { listCategories } from "@/lib/repositories/categories";
import { getSiteByUrl } from "@/lib/repositories/sites";
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
    // Honeypot filled — pretend success.
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
      "Could not save submission. Database may not be migrated yet — try again after setup.",
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

export async function approveSubmissionAsAdmin(id: string, notes?: string) {
  await requireAdminUser();
  const existing = await getSubmissionById(id);
  if (!existing) {
    throw new Error("Submission not found");
  }
  return updateSubmissionStatus(id, "approved", notes);
}
