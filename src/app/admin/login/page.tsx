import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInWithEmail } from "@/app/admin/actions";
import { getAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin login",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; sent?: string }>;
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
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Magic link sign-in. Your email must be in <code>ADMIN_EMAILS</code>.
        </p>

        {params.sent ? (
          <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]">
            Check your email for the login link.
          </p>
        ) : null}

        {params.error ? (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {params.error}
          </p>
        ) : null}

        <form action={signInWithEmail} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]/55"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Send magic link
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">
            ← Back to site
          </Link>
        </p>
      </section>
    </main>
  );
}
