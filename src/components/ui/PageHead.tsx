import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";

type PageHeadProps = {
  label: string;
  labelHref?: string;
  title: string;
  lead?: string | null;
  /** The one architectural number this page is about. */
  stat?: { value: string; caption: string };
  /** Shared name with the list row that opened this page, so the title morphs. */
  transitionName?: string;
  children?: ReactNode;
};

/** Every interior page opens the same way: label, title, one number. */
export function PageHead({
  label,
  labelHref,
  title,
  lead,
  stat,
  transitionName,
  children,
}: PageHeadProps) {
  const heading = (
    <h1 className="display break-words text-[clamp(2.5rem,8vw,6.5rem)] text-[var(--ink)]">
      {title}
    </h1>
  );

  return (
    <header className="enter pb-14 pt-4 sm:pb-20">
      {labelHref ? (
        <Link href={labelHref} className="label transition-colors hover:text-[var(--ink)]">
          ← {label}
        </Link>
      ) : (
        <p className="label">{label}</p>
      )}

      <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {transitionName ? (
            <ViewTransition name={transitionName}>{heading}</ViewTransition>
          ) : (
            heading
          )}
          {lead ? (
            <p className="lede mt-6 max-w-2xl text-[var(--muted)]">
              {lead}
            </p>
          ) : null}
        </div>

        {stat ? (
          <div className="shrink-0 lg:text-right">
            <p className="numeral ink-accent text-[4.5rem] leading-[0.8] sm:text-[7rem]">
              {stat.value}
            </p>
            <p className="label mt-4">{stat.caption}</p>
          </div>
        ) : null}
      </div>

      {children ? (
        <div className="mt-10 flex flex-wrap items-center gap-3">{children}</div>
      ) : null}
    </header>
  );
}
