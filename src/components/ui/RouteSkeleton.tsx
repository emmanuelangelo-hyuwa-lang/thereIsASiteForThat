type RouteSkeletonProps = {
  label: string;
  rows?: number;
};

/**
 * What a page looks like while it resolves: the same geometry, drawn empty,
 * with a scanning line instead of a spinner. No layout shift when the real
 * content lands.
 */
export function RouteSkeleton({ label, rows = 5 }: RouteSkeletonProps) {
  return (
    <main className="shell flex flex-1 flex-col pb-10 pt-4">
      <p className="label label-accent">{label}</p>

      <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-2xl">
          <div className="ghost h-[clamp(2.5rem,8vw,6.5rem)] w-4/5" />
          <div className="ghost mt-6 h-5 w-3/5" />
        </div>
        <div className="ghost h-[4.5rem] w-32 shrink-0 sm:h-[7rem] sm:w-48" />
      </div>

      <div className="scanner mt-14" />

      <ul className="stagger">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            style={{ ["--i" as string]: index }}
            className="flex items-start gap-5 border-t border-[var(--hair)] py-6 sm:gap-8"
          >
            <div className="ghost mt-1 h-4 w-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="ghost h-7 w-1/3 sm:h-8" />
              <div className="ghost mt-3 h-4 w-3/4" />
              <div className="ghost mt-2.5 h-3 w-1/2" />
            </div>
            <div className="ghost h-9 w-16 shrink-0" />
          </li>
        ))}
      </ul>
    </main>
  );
}
