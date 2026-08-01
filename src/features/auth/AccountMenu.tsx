import Link from "next/link";

import { signInWithGoogle, signOutAction } from "@/app/actions/auth";
import { auth } from "@/auth";

export async function AccountMenu() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signInWithGoogle("/me");
        }}
      >
        <button
          type="submit"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          Sign in
        </button>
      </form>
    );
  }

  const name = session.user.name ?? session.user.email ?? "Account";
  const image = session.user.image;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/me"
        className="flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px] rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-semibold text-[var(--ink)]"
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
