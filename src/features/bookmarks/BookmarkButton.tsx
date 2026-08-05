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
        "btn btn-line h-14 px-8"
      }
    >
      {pending ? "Saving" : bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
