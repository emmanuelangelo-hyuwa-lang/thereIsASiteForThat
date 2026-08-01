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
    <section className="panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
          How it works
        </h2>
      </div>
      <ol className="grid sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className={`px-6 py-7 sm:px-8 ${
              index < STEPS.length - 1 ? "border-b border-[var(--border)] sm:border-b-0 sm:border-r" : ""
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
              0{index + 1}
            </p>
            <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
