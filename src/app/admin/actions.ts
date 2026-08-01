"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/auth/session";
import { createSiteAsAdmin, updateSiteAsAdmin } from "@/lib/services/sites";
import {
  approveSubmissionAsAdmin,
  rejectSubmissionAsAdmin,
} from "@/lib/services/submissions";
import { slugify } from "@/lib/utils/slugify";

function splitLines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitTags(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function formToSiteInput(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slugRaw = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating") ?? 4);

  return {
    name,
    slug: slugRaw || slugify(name),
    url: String(formData.get("url") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    pricing: String(formData.get("pricing") ?? "freemium"),
    pros: splitLines(formData.get("pros")),
    cons: splitLines(formData.get("cons")),
    rating: Number.isFinite(rating) ? rating : 4,
    tags: splitTags(formData.get("tags")),
    status: String(formData.get("status") ?? "draft"),
  };
}

export async function signInWithPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    redirect("/admin/login?error=Admin%20env%20is%20not%20configured");
  }

  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=Invalid%20password");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function signOutAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function createSiteAction(formData: FormData) {
  try {
    const site = await createSiteAsAdmin(formToSiteInput(formData));
    revalidatePath("/admin/sites");
    redirect(`/admin/sites/${site.id}?saved=1`);
  } catch (error) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : "Failed to create site";
    redirect(`/admin/sites/new?error=${encodeURIComponent(message)}`);
  }
}

export async function updateSiteAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    await updateSiteAsAdmin(id, formToSiteInput(formData));
    revalidatePath("/admin/sites");
    revalidatePath(`/admin/sites/${id}`);
    redirect(`/admin/sites/${id}?saved=1`);
  } catch (error) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : "Failed to update site";
    redirect(`/admin/sites/${id}?error=${encodeURIComponent(message)}`);
  }
}

export async function approveSubmissionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    await approveSubmissionAsAdmin(id);
    revalidatePath("/admin/submissions");
    redirect("/admin/submissions");
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error ? error.message : "Failed to approve submission";
    redirect(`/admin/submissions?error=${encodeURIComponent(message)}`);
  }
}

export async function rejectSubmissionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    await rejectSubmissionAsAdmin(id);
    revalidatePath("/admin/submissions");
    redirect("/admin/submissions");
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error ? error.message : "Failed to reject submission";
    redirect(`/admin/submissions?error=${encodeURIComponent(message)}`);
  }
}
