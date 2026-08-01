import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAdmin } from "@/app/admin/actions";
import { getAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <div className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Admin
          </p>
          <p className="mt-1 text-sm text-[var(--ink)]">Signed in</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/admin" className="text-[var(--muted)] transition hover:text-[var(--ink)]">
            Dashboard
          </Link>
          <Link href="/admin/sites" className="text-[var(--muted)] transition hover:text-[var(--ink)]">
            Sites
          </Link>
          <Link
            href="/admin/sites/new"
            className="font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
          >
            New site
          </Link>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
