"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveSearchAction } from "@/app/actions/saved-searches";

type SaveSearchButtonProps = {
  query: string;
  initialSaved: boolean;
  callbackPath: string;
};

export function SaveSearchButton({
  query,
  initialSaved,
  callbackPath,
}: SaveSearchButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  if (query.trim().length < 2) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={pending || saved}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await saveSearchAction(query, callbackPath);
            if (result.success) {
              setSaved(true);
              router.refresh();
            }
          } catch {
            // signIn redirects
          }
        });
      }}
      className="inline-flex rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)]/40 disabled:opacity-60"
    >
      {pending ? "Saving…" : saved ? "Search saved" : "Save search"}
    </button>
  );
}
