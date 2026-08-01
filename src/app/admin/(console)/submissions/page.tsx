import Link from "next/link";

import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/admin/actions";
import { listSubmissionsForAdmin } from "@/lib/services/submissions";

export default async function AdminSubmissionsPage() {
  let rows: Awaited<ReturnType<typeof listSubmissionsForAdmin>> = [];
  let dbReady = true;

  try {
    rows = await listSubmissionsForAdmin();
  } catch {
    dbReady = false;
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
          Submissions
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pending public suggestions. Approve marks the queue; create the site from Sites if needed.
        </p>
      </div>

      {!dbReady ? (
        <p className="px-6 py-8 text-sm text-[var(--muted)] sm:px-8">
          Database not ready — run migrate before moderating submissions.
        </p>
      ) : rows.length === 0 ? (
        <p className="px-6 py-8 text-sm text-[var(--muted)] sm:px-8">
          No pending submissions.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {rows.map((submission) => (
            <li key={submission.id} className="px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[var(--ink)]">
                    {submission.name}
                  </p>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 break-all text-sm text-[var(--accent)]"
                  >
                    {submission.url}
                  </a>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {submission.description}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {submission.categorySlug ?? "uncategorized"}
                    {submission.submitterEmail
                      ? ` · ${submission.submitterEmail}`
                      : null}
                    {submission.tags.length > 0
                      ? ` · ${submission.tags.join(", ")}`
                      : null}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/admin/sites/new?name=${encodeURIComponent(submission.name)}&url=${encodeURIComponent(submission.url)}`}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--ink)]"
                  >
                    Open new site
                  </Link>
                  <form action={approveSubmissionAction}>
                    <input type="hidden" name="id" value={submission.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectSubmissionAction}>
                    <input type="hidden" name="id" value={submission.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)]"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
