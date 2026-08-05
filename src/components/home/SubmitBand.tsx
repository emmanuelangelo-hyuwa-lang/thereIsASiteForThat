import Link from "next/link";

export function SubmitBand() {
  return (
    <section id="submit" className="shell reveal">
      <div className="slab-accent flex flex-col justify-between gap-10 p-8 sm:p-14 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="label text-[var(--on-accent)]/75">Open catalog</p>
          <h2 className="display mt-6 text-[clamp(2.25rem,7vw,5rem)] text-[var(--on-accent)]">
            Know a
            <br />
            better site?
          </h2>
        </div>
        <Link
          href="/submit"
          className="btn h-16 shrink-0 bg-[var(--on-accent)] px-10 text-base text-[var(--accent)] hover:bg-[var(--on-accent)]/85"
        >
          Submit a site
        </Link>
      </div>
    </section>
  );
}
