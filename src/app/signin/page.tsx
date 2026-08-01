import Link from "next/link";
import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/app/actions/auth";
import { auth } from "@/auth";

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/me";

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Account
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)]">
          Save sites you like
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Sign in with Google to bookmark sites across devices. Search and browse
          stay free — no account required.
        </p>
        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signInWithGoogle(callbackUrl);
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Continue with Google
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">
            ← Back to search
          </Link>
        </p>
      </section>
    </main>
  );
}
