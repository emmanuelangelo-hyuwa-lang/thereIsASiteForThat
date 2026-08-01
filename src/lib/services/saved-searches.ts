import { getSessionUser, requireSessionUser } from "@/lib/auth/user";
import {
  countSavedSearchesForUser,
  deleteSavedSearch,
  getSavedSearchByUserAndSlug,
  listSavedSearchesForUser,
  upsertSavedSearch,
} from "@/lib/repositories/saved-searches";
import { normalizeQuery } from "@/lib/utils/normalize-query";
import { slugify } from "@/lib/utils/slugify";

export async function getSavedSearchState(query: string): Promise<{
  saved: boolean;
  signedIn: boolean;
  slug: string;
}> {
  const normalized = normalizeQuery(query);
  const slug = slugify(normalized);
  if (normalized.length < 2) {
    return { saved: false, signedIn: false, slug };
  }

  const user = await getSessionUser();
  if (!user) {
    return { saved: false, signedIn: false, slug };
  }

  const existing = await getSavedSearchByUserAndSlug(user.id, slug);
  return { saved: Boolean(existing), signedIn: true, slug };
}

export async function saveSearchForCurrentUser(query: string) {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) {
    throw new Error("Query must be at least 2 characters");
  }

  const user = await requireSessionUser();
  const slug = slugify(normalized);
  return upsertSavedSearch({
    userId: user.id,
    query: normalized,
    slug,
  });
}

export async function removeSavedSearchForCurrentUser(id: string) {
  const user = await requireSessionUser();
  await deleteSavedSearch(user.id, id);
}

export async function listCurrentUserSavedSearches() {
  const user = await requireSessionUser();
  return listSavedSearchesForUser(user.id);
}

export async function getCurrentUserSavedSearchCount() {
  const user = await requireSessionUser();
  return countSavedSearchesForUser(user.id);
}
