"use client";

import { useMemo, useState } from "react";

import { Pagination } from "@/components/admin/pagination";
import type { ProductPerf } from "@/data/mock-analytics";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 5;

export function ProductRanking({ items }: { items: ProductPerf[] }) {
  const [mode, setMode] = useState<"mais" | "menos">("mais");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => ["todas", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const filtered = useMemo(() => {
    const list = items
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .filter((item) => category === "todas" || item.category === category)
      .slice()
      .sort((a, b) => (mode === "mais" ? b.quantity - a.quantity : a.quantity - b.quantity));
    return list;
  }, [items, query, category, mode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-lg font-semibold">Desempenho dos produtos</h2>
        <div className="flex flex-wrap gap-2">
          {(["mais", "menos"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setPage(1);
              }}
              className={
                mode === option
                  ? "rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                  : "rounded-lg bg-zinc-100 px-3 py-1.5 text-sm"
              }
            >
              {option === "mais" ? "Mais vendidos" : "Menos vendidos"}
            </button>
          ))}
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar produto"
            className="h-9 rounded-lg border border-zinc-200 px-3 text-sm"
          />
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-zinc-200 px-3 text-sm"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "todas" ? "Todas as categorias" : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs text-subtle">
            <tr>
              {["Posição", "Produto", "Categoria", "Quantidade", "Faturamento", "Ticket médio"].map((head) => (
                <th key={head} className="px-3 py-2 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item, index) => {
              const ticket = item.quantity === 0 ? 0 : item.revenue / item.quantity;
              return (
                <tr key={item.id} className="border-t border-zinc-100">
                  <td className="px-3 py-3">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="size-10 rounded-lg object-cover" />
                      {item.name}
                    </span>
                  </td>
                  <td className="px-3 py-3">{item.category}</td>
                  <td className="px-3 py-3">{item.quantity}</td>
                  <td className="px-3 py-3">{formatCurrency(item.revenue)}</td>
                  <td className="px-3 py-3">{formatCurrency(ticket)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <Pagination label={`Mostrando ${pageItems.length} de ${filtered.length} produtos`} pages={[1, 2].slice(0, totalPages)} />
        {totalPages > 1 ? (
          <button
            type="button"
            className="text-sm text-brand"
            onClick={() => setPage((current) => (current >= totalPages ? 1 : current + 1))}
          >
            Próxima página
          </button>
        ) : null}
      </div>
    </section>
  );
}
