"use server";

import { revalidatePath } from "next/cache";

import { signIn } from "@/auth";
import { getSessionUser } from "@/lib/auth/user";
import { toggleBookmarkForCurrentUser } from "@/lib/services/bookmarks";

export async function toggleBookmarkAction(
  siteId: string,
  callbackPath?: string,
) {
  const user = await getSessionUser();
  if (!user) {
    await signIn("google", {
      redirectTo: callbackPath ?? "/me/bookmarks",
    });
    return { success: false as const, bookmarked: false };
  }

  const result = await toggleBookmarkForCurrentUser(siteId);
  revalidatePath("/me");
  revalidatePath("/me/bookmarks");
  if (callbackPath) {
    revalidatePath(callbackPath);
  }
  return { success: true as const, ...result };
}
