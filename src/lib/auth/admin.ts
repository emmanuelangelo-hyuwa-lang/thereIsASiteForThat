import { getAdminEmails } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return null;
    }

    const allowlist = getAdminEmails();
    if (allowlist.length === 0) {
      return null;
    }

    const email = user.email.toLowerCase();
    if (!allowlist.includes(email)) {
      return null;
    }

    return { id: user.id, email };
  } catch {
    return null;
  }
}

export async function requireAdminUser(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error("Admin access required");
  }
  return admin;
}
