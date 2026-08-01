"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toggleBookmarkAction } from "@/app/actions/bookmarks";

type BookmarkButtonProps = {
  siteId: string;
  initialBookmarked: boolean;
  bookmarkable: boolean;
  callbackPath: string;
  className?: string;
};

export function BookmarkButton({
  siteId,
  initialBookmarked,
  bookmarkable,
  callbackPath,
  className,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  if (!bookmarkable) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await toggleBookmarkAction(siteId, callbackPath);
            if (result.success) {
              setBookmarked(result.bookmarked);
              router.refresh();
            }
          } catch {
            // signIn redirects; ignore
          }
        });
      }}
      className={
        className ??
        "inline-flex rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)]/40 disabled:opacity-60"
      }
    >
      {pending ? "Saving…" : bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
