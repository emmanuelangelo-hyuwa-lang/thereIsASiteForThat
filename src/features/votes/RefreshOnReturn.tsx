"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { takeVerdictPending } from "@/features/votes/pending";

/**
 * Re-renders the page when the visitor comes back from the site they opened,
 * so the verdict question appears without a manual reload.
 *
 * It refreshes only after a real outbound click, never on an ordinary tab
 * switch, because reloading a page somebody is reading is worse than making
 * them wait for the question.
 */
export function RefreshOnReturn({ siteId }: { siteId: string }) {
  const router = useRouter();

  useEffect(() => {
    function onReturn() {
      if (document.visibilityState !== "visible") {
        return;
      }

      // Reading clears the marker, so visibilitychange and focus firing
      // together cannot trigger two refreshes.
      if (takeVerdictPending(siteId)) {
        router.refresh();
      }
    }

    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [router, siteId]);

  return null;
}
