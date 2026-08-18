"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Pencil, Search } from "lucide-react";

import { CategoryFormDialog, emptyCategoryDraft, type CategoryDraft } from "@/components/admin/category-form-dialog";
import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson } from "@/lib/admin-api";

type CategoryRow = {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  active: number;
  productCount: number;
};

export function LiveCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const payload = await adminJson<{ categories: CategoryRow[] }>("/api/mipede/v1/catalog/categories");
    setRows(payload.categories ?? []);
  }

  useEffect(() => {
    void fetch("/api/mipede/v1/catalog/categories", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { categories?: CategoryRow[] } | null) => {
        if (!payload) {
          setError("Não foi possível carregar as categorias.");
          return;
        }
        setRows(payload.categories ?? []);
      });
  }, []);

  const filtered = rows.filter((row) => {
    if (status === "active" && !row.active) return false;
    if (status === "paused" && row.active) return false;
    return row.name.toLowerCase().includes(query.toLowerCase());
  });
  const nextOrder = useMemo(() => rows.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1, [rows]);

  async function save() {
    if (!draft?.name.trim()) return;
    try {
      if (draft.id) {
        await adminJson(`/api/mipede/v1/catalog/categories/${draft.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: draft.name,
            description: draft.description,
            active: draft.visible,
            sortOrder: draft.order,
          }),
        });
        setToast("Categoria atualizada.");
      } else {
        await adminJson("/api/mipede/v1/catalog/categories", {
          method: "POST",
          body: JSON.stringify({
            name: draft.name,
            description: draft.description,
            active: draft.visible,
            sortOrder: draft.order,
          }),
        });
        setToast("Categoria salva com sucesso.");
      }
      setDraft(null);
      await load();
    } catch (item) {
      setError(item instanceof Error ? item.message : "Não foi possível salvar.");
    }
  }

  return (
    <div>
      <PageHeading
        title="Categorias"
        description="Organize as seções do seu cardápio"
        action={
          <button
            type="button"
            onClick={() => setDraft(emptyCategoryDraft(nextOrder))}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
          >
            Nova categoria
          </button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar categoria"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-3 pl-9 text-sm"
          />
        </label>
        <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todas</option>
          <option value="active">Ativas</option>
          <option value="paused">Pausadas</option>
        </select>
      </div>
      <p className="mb-4 flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-700">
        <Info className="mt-0.5 size-4 shrink-0" />
        Arraste as categorias para definir a ordem exibida no cardápio.
      </p>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Ordem", "Categoria", "Produtos", "Disponibilidade", "Status", "Ações"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p className="font-medium">Nenhuma categoria criada</p>
                    <p className="mt-1 text-sm text-subtle">Crie a primeira categoria para começar a organizar seu cardápio.</p>
                    <button
                      type="button"
                      className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
                      onClick={() => setDraft(emptyCategoryDraft(nextOrder))}
                    >
                      Criar categoria
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr key={category.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3 text-zinc-400">{category.sortOrder}</td>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3">{category.productCount} produtos</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() =>
                          void adminJson(`/api/mipede/v1/catalog/categories/${category.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ name: category.name, active: !category.active }),
                          }).then(load)
                        }
                      >
                        <Switch checked={Boolean(category.active)} aria-label="Disponibilidade" />
                        {category.active ? "Disponível" : "Indisponível"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={category.active ? "Ativa" : "Pausada"} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`Editar ${category.name}`}
                        onClick={() =>
                          setDraft({
                            id: category.id,
                            name: category.name,
                            description: category.description ?? "",
                            status: category.active ? "Ativa" : "Pausada",
                            availability: "sempre",
                            days: [],
                            start: "18:00",
                            end: "23:00",
                            order: category.sortOrder,
                            visible: Boolean(category.active),
                          })
                        }
                      >
                        <Pencil className="size-4 text-zinc-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination label={`${filtered.length} categorias`} pages={[1]} />
      </div>
      {draft ? (
        <CategoryFormDialog open onChange={setDraft} draft={draft} onClose={() => setDraft(null)} onSave={() => void save()} />
      ) : null}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
