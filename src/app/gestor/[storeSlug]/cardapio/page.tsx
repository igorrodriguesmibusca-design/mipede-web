"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { quickCategories } from "@/data/mock-order-manager";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export default function QuickCatalogPage() {
  const { products, toggleProduct, toggleCategory, pausedCount } = useOrderManager();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "ativos" | "pausados">("todos");
  const [openCats, setOpenCats] = useState<string[]>(quickCategories.map((item) => item.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);

  const visible = useMemo(
    () =>
      products.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
          filter === "todos" || (filter === "ativos" ? !item.paused : item.paused);
        return matchesQuery && matchesFilter;
      }),
    [products, query, filter],
  );

  function pauseSelected() {
    selected.forEach((id) => {
      const item = products.find((product) => product.id === id);
      if (item && !item.paused) toggleProduct(id);
    });
    setSelected([]);
    setConfirm(false);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cardápio rápido</h1>
          <p className="mt-1 max-w-xl text-sm text-subtle">
            Pause ou reative itens durante a operação. Para editar nomes, preços, fotos ou complementos, utilize o Painel Administrativo.
          </p>
          <p className="mt-1 text-sm">{pausedCount} itens pausados agora</p>
        </div>
        <Link
          href={routes.admin.products}
          className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
        >
          Abrir Painel Administrativo
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar item</span>
          <Search className="absolute top-3 left-3 size-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar item"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-3 pl-9 text-sm"
          />
        </label>
        {(["todos", "ativos", "pausados"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={
              filter === item
                ? "h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
                : "h-11 rounded-xl bg-white px-4 text-sm"
            }
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setConfirm(true)}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm disabled:opacity-40"
        >
          Pausar seleção ({selected.length})
        </button>
      </div>

      <div className="space-y-3">
        {quickCategories.map((category) => {
          const items = visible.filter((item) => item.categoryId === category.id);
          if (items.length === 0) return null;
          const open = openCats.includes(category.id);
          const allPaused = items.every((item) => item.paused);
          return (
            <section key={category.id} className="rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    setOpenCats((current) =>
                      current.includes(category.id)
                        ? current.filter((id) => id !== category.id)
                        : [...current, category.id],
                    )
                  }
                  className="flex items-center gap-2 font-semibold"
                >
                  {category.name}
                  <span className="text-sm font-normal text-subtle">{items.length}</span>
                  <ChevronDown className={`size-4 ${open ? "rotate-180" : ""}`} />
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <span>Pausar categoria</span>
                  <Switch
                    checked={allPaused}
                    aria-label={`Pausar ${category.name}`}
                    onClick={() => toggleCategory(category.id, !allPaused)}
                  />
                </div>
              </div>
              {open ? (
                <ul className="border-t border-zinc-100">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          )
                        }
                        aria-label={item.name}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-subtle">{item.description}</p>
                      </div>
                      <span className="text-sm">{formatCurrency(item.price)}</span>
                      <span className={item.paused ? "text-xs text-amber-700" : "text-xs text-success"}>
                        {item.paused ? "Pausado" : "Ativo"}
                      </span>
                      <Switch
                        checked={!item.paused}
                        aria-label={`Reativar ou pausar ${item.name}`}
                        onClick={() => toggleProduct(item.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Pausar itens selecionados">
        <p className="mb-4 text-sm">Confirma pausar {selected.length} item(ns) na operação?</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setConfirm(false)} className="h-10 rounded-xl border px-4 text-sm">
            Voltar
          </button>
          <button type="button" onClick={pauseSelected} className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Confirmar
          </button>
        </div>
      </Dialog>
    </div>
  );
}
