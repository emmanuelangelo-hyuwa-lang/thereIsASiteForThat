import { hasAdminSession } from "@/lib/auth/session";

export type AdminUser = {
  authenticated: true;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const ok = await hasAdminSession();
  return ok ? { authenticated: true } : null;
}

export async function requireAdminUser(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error("Admin access required");
  }
  return admin;
}
