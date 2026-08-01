"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle(callbackUrl = "/me") {
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
