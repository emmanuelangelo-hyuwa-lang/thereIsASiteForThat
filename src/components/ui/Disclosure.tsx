import type { ReactNode } from "react";

type DisclosureProps = {
  summary: string;
  hint?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

/**
 * Native `<details>`, keyboard accessible, searchable by the browser, and
 * open-able with no JavaScript at all. Used anywhere the detail is worth
 * keeping but not worth spending the reader's attention on by default.
 */
export function Disclosure({
  summary,
  hint,
  children,
  defaultOpen = false,
}: DisclosureProps) {
  return (
    <details className="disclosure" open={defaultOpen}>
      <summary className="disclosure__summary">
        <span className="headline text-lg text-[var(--ink)] sm:text-xl">
          {summary}
        </span>
        {hint ? <span className="label ml-auto mr-3">{hint}</span> : null}
        <span className="disclosure__mark" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </summary>
      <div className="disclosure__body">{children}</div>
    </details>
  );
}
