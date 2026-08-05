import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInWithPassword } from "@/app/admin/actions";
import { getAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin login",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const admin = await getAdminUser();
  if (admin) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <section className="panel px-6 py-8 sm:px-8">
        <h1 className="headline text-3xl text-[var(--ink)]">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Password auth for solo admin. Set <code>ADMIN_PASSWORD</code> and{" "}
          <code>ADMIN_SESSION_SECRET</code> in <code>.env.local</code>.
        </p>

        {params.error ? (
          <p className="mt-6 rounded-[var(--r-s)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {params.error}
          </p>
        ) : null}

        <form action={signInWithPassword} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-[var(--r-s)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--ink)] outline-none focus:shadow-[inset_0_0_0_2px_var(--accent)]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-[var(--r-s)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:opacity-90">
            ← Back to site
          </Link>
        </p>
      </section>
    </main>
  );
}
