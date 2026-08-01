"use server";

import { revalidatePath } from "next/cache";

import { signIn } from "@/auth";
import { getSessionUser } from "@/lib/auth/user";
import {
  removeSavedSearchForCurrentUser,
  saveSearchForCurrentUser,
} from "@/lib/services/saved-searches";

export async function saveSearchAction(query: string, callbackPath?: string) {
  const user = await getSessionUser();
  if (!user) {
    await signIn("google", {
      redirectTo: callbackPath ?? "/me/searches",
    });
    return { success: false as const, saved: false };
  }

  await saveSearchForCurrentUser(query);
  revalidatePath("/me");
  revalidatePath("/me/searches");
  if (callbackPath) {
    revalidatePath(callbackPath);
  }
  return { success: true as const, saved: true };
}

export async function deleteSavedSearchAction(id: string) {
  await removeSavedSearchForCurrentUser(id);
  revalidatePath("/me");
  revalidatePath("/me/searches");
  return { success: true as const };
}
