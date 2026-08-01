import {
  countBookmarksForUser,
  deleteBookmark,
  insertBookmark,
  isSiteBookmarked,
  listBookmarksForUser,
} from "@/lib/repositories/bookmarks";
import { getSessionUser, requireSessionUser } from "@/lib/auth/user";
import { getSiteById } from "@/lib/repositories/sites";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBookmarkableSiteId(siteId: string): boolean {
  return UUID_RE.test(siteId) && !siteId.startsWith("seed_");
}

export async function getBookmarkState(siteId: string): Promise<{
  bookmarked: boolean;
  signedIn: boolean;
  bookmarkable: boolean;
}> {
  const bookmarkable = isBookmarkableSiteId(siteId);
  if (!bookmarkable) {
    return { bookmarked: false, signedIn: false, bookmarkable: false };
  }

  const user = await getSessionUser();
  if (!user) {
    return { bookmarked: false, signedIn: false, bookmarkable: true };
  }

  const bookmarked = await isSiteBookmarked(user.id, siteId);
  return { bookmarked, signedIn: true, bookmarkable: true };
}

export async function toggleBookmarkForCurrentUser(siteId: string): Promise<{
  bookmarked: boolean;
}> {
  if (!isBookmarkableSiteId(siteId)) {
    throw new Error("This site cannot be bookmarked yet");
  }

  const site = await getSiteById(siteId);
  if (!site || site.status !== "published") {
    throw new Error("Site not found");
  }

  const user = await requireSessionUser();
  const existing = await isSiteBookmarked(user.id, siteId);
  if (existing) {
    await deleteBookmark(user.id, siteId);
    return { bookmarked: false };
  }

  await insertBookmark(user.id, siteId);
  return { bookmarked: true };
}

export async function listCurrentUserBookmarks() {
  const user = await requireSessionUser();
  const rows = await listBookmarksForUser(user.id);
  return rows.map((row) => ({
    id: row.siteId,
    name: row.name,
    slug: row.slug,
    url: row.url,
    description: row.description,
    pricing: row.pricing,
    rating: Number.parseFloat(row.rating),
    tags: row.tags,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    bookmarkedAt: row.bookmarkedAt,
  }));
}

export async function getCurrentUserBookmarkCount() {
  const user = await requireSessionUser();
  return countBookmarksForUser(user.id);
}
