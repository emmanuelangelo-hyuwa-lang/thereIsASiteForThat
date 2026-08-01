import { auth } from "@/auth";
import { getUserById, type UserRow } from "@/lib/repositories/users";

export async function getSessionUser(): Promise<UserRow | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }
  return getUserById(userId);
}

export async function requireSessionUser(): Promise<UserRow> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}
