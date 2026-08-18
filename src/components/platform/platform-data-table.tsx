import { cn } from "@/lib/utils";

export type PlatformTableColumn<T> = {
  id: string;
  header: string;
  className?: string;
  cell: (row: T) => React.ReactNode;
  mobile?: boolean;
};

export function PlatformDataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  mobileTitle,
}: {
  columns: Array<PlatformTableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  empty: React.ReactNode;
  mobileTitle?: (row: T) => React.ReactNode;
}) {
  if (rows.length === 0) return <>{empty}</>;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-100 text-xs tracking-wide text-subtle uppercase">
            <tr>
              {columns.map((column) => (
                <th key={column.id} className={cn("px-4 py-3 font-medium", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-zinc-50 last:border-0">
                {columns.map((column) => (
                  <td key={column.id} className={cn("px-4 py-3 align-middle", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={rowKey(row)} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            {mobileTitle ? <div className="mb-3 font-medium">{mobileTitle(row)}</div> : null}
            <dl className="space-y-2 text-sm">
              {columns
                .filter((column) => column.mobile !== false)
                .map((column) => (
                  <div key={column.id} className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-subtle">{column.header}</dt>
                    <dd className="text-right">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
