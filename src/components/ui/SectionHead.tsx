import Link from "next/link";

type SectionHeadProps = {
  label: string;
  title: string;
  count?: number;
  href?: string;
  hrefLabel?: string;
};

/** One header shape, repeated until it is recognizable. */
export function SectionHead({
  label,
  title,
  count,
  href,
  hrefLabel = "See all",
}: SectionHeadProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pb-8">
      <div className="min-w-0">
        <p className="label">{label}</p>
        <h2 className="headline mt-4 text-4xl text-[var(--ink)] sm:text-6xl">
          {title}
          {typeof count === "number" ? (
            <span className="numeral ml-4 align-top text-xl text-[var(--muted)] sm:text-2xl">
              {String(count).padStart(2, "0")}
            </span>
          ) : null}
        </h2>
      </div>
      {href ? (
        <Link href={href} className="chip h-11 px-5">
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}
