import Link from "next/link";

export function SubmitBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
      <div className="section-rule flex flex-col items-start justify-between gap-4 py-12 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
            Know a great site?
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Suggest something useful. We review submissions and add the keepers to the catalog.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex shrink-0 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          Submit a site
        </Link>
      </div>
    </section>
  );
}
