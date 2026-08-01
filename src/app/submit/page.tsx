import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a site",
  description: "Suggest a website for the ThereIsASiteForThat directory.",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)]">
        Submit a site
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Public submissions will be reviewed before publishing. The form lands in the next build phase.
      </p>
    </main>
  );
}
