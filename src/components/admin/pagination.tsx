export function Pagination({
  label,
  pages = [1, 2, 3],
}: {
  label: string;
  pages?: Array<number | string>;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
      <p>{label}</p>
      <div className="flex items-center gap-1">
        <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-200">
          ‹
        </span>
        {pages.map((page) => (
          <span
            key={page}
            className={
              page === 1
                ? "flex size-8 items-center justify-center rounded-lg bg-brand text-white"
                : "flex size-8 items-center justify-center rounded-lg border border-zinc-200"
            }
          >
            {page}
          </span>
        ))}
        <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-200">
          ›
        </span>
      </div>
    </div>
  );
}
