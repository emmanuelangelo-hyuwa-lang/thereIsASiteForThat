const STEPS = [
  {
    title: "Search",
    body: "Describe the task in plain language — compress a PDF, make a resume, pick colors.",
  },
  {
    title: "Match",
    body: "We rank curated sites with a confidence score, or fall back to an AI suggestion when needed.",
  },
  {
    title: "Visit",
    body: "Open the best site and get on with it. No feed to scroll, no ads pretending to be answers.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--ink)]">
        How it works
      </h2>
      <ol className="mt-8 space-y-6">
        {STEPS.map((step, index) => (
          <li key={step.title} className="grid gap-2 sm:grid-cols-[3rem_1fr] sm:gap-4">
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--accent)]">
              0{index + 1}
            </span>
            <div>
              <h3 className="text-base font-semibold text-[var(--ink)]">{step.title}</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
