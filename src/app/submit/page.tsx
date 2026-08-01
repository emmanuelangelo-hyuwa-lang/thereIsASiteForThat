import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a site",
  description: "Suggest a website for the ThereIsASiteForThat directory.",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel mx-auto w-full max-w-2xl px-6 py-10 sm:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Submit a site
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Suggest a website for the directory. Submissions are reviewed before
          publishing — quality over volume.
        </p>
        <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-sm text-[var(--muted)]">
          The submission form lands in the next build phase.
        </div>
      </section>
    </main>
  );
}
