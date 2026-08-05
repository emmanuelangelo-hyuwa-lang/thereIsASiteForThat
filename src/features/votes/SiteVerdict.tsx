"use client";

import { useState, useTransition } from "react";

import type { Verdict } from "@/lib/services/votes";
import type { ApiResponse } from "@/lib/utils/api-response";

type SiteVerdictProps = {
  siteId: string;
  siteName: string;
  editorScore: number;
  initial: Verdict;
};

type VoteResult = {
  solved: number;
  total: number;
  solveRate: number | null;
};

/**
 * The community verdict band. One question, two answers, one number, and the
 * question only appears for someone who has actually been to the site.
 */
export function SiteVerdict({
  siteId,
  siteName,
  editorScore,
  initial,
}: SiteVerdictProps) {
  const [verdict, setVerdict] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function vote(solved: boolean) {
    setError(null);
    const previous = verdict;

    // Optimistic: the number should move the instant you press.
    setVerdict((current) => {
      const hadVote = current.myVote !== null;
      const total = hadVote ? current.total : current.total + 1;
      const solvedCount =
        (hadVote && current.myVote ? current.solved - 1 : current.solved) +
        (solved ? 1 : 0);
      return {
        ...current,
        myVote: solved,
        total,
        solved: solvedCount,
        solveRate: total >= 3 ? Math.round((solvedCount / total) * 100) : null,
      };
    });

    startTransition(async () => {
      try {
        const response = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId, solved }),
        });
        const json = (await response.json()) as ApiResponse<VoteResult>;
        if (!json.success) {
          setVerdict(previous);
          setError(json.error);
          return;
        }
        setVerdict((current) => ({ ...current, ...json.data }));
      } catch {
        setVerdict(previous);
        setError("That vote did not go through");
      }
    });
  }

  const hasRate = verdict.solveRate !== null;

  return (
    <section className="border-t border-[var(--hair)] pt-12">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="label label-accent">
            {hasRate ? "Community verdict" : "Editor score"}
          </p>

          <p className="numeral ink-accent mt-6 text-[5rem] leading-[0.78] sm:text-[8rem]">
            {hasRate ? (
              <>
                {verdict.solveRate}
                <span className="align-super text-[0.42em]">%</span>
              </>
            ) : (
              editorScore.toFixed(1)
            )}
          </p>

          {/* The verdict made physical. */}
          <div className="meter mt-8 max-w-md" aria-hidden="true">
            <span
              key={hasRate ? verdict.solveRate : "editor"}
              className="meter-fill"
              style={{
                width: `${hasRate ? verdict.solveRate : (editorScore / 5) * 100}%`,
              }}
            />
          </div>

          <p className="copy mt-6 max-w-md text-[var(--muted)]">
            {hasRate ? (
              <>
                said {siteName} solved what they came for. That is{" "}
                <span className="numeral text-[var(--ink)]">
                  {verdict.total}
                </span>{" "}
                {verdict.total === 1 ? "verdict" : "verdicts"} so far.
              </>
            ) : verdict.total > 0 ? (
              <>
                Our score for now. {verdict.total}{" "}
                {verdict.total === 1 ? "person has" : "people have"} voted.
                Three opens it up to the room.
              </>
            ) : (
              <>Our score, until enough people have used it and told us.</>
            )}
          </p>
        </div>

        <div className="shrink-0 lg:max-w-sm lg:text-right">
          {verdict.myVote !== null ? (
            <>
              <p className="headline text-2xl text-[var(--ink)]">
                You said {verdict.myVote ? "it solved it" : "it did not"}.
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={() => vote(!verdict.myVote)}
                className="label mt-4 underline underline-offset-4 transition-colors hover:text-[var(--ink)] disabled:opacity-50"
              >
                Change my answer
              </button>
            </>
          ) : verdict.canVote ? (
            <>
              <p className="headline text-2xl text-[var(--ink)] sm:text-3xl">
                Did it solve it?
              </p>
              <div className="mt-5 flex flex-wrap gap-3 lg:justify-end">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => vote(true)}
                  className="btn btn-accent h-14 px-10"
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => vote(false)}
                  className="btn btn-line h-14 px-10"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="headline text-2xl text-[var(--ink)]">
                Votes are earned.
              </p>
              <p className="copy mt-3 text-[var(--muted)]">
                Open {siteName} from this page and the question appears when you
                come back. No account, no email. Just people who actually used
                it.
              </p>
            </>
          )}

          {error ? (
            <p className="label mt-4" style={{ color: "#ff5c1a" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
