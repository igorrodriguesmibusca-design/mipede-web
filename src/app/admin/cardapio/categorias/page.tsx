"use client";

import { useMemo, useState } from "react";
import { GripVertical, Info, MoreVertical, Pencil, Search } from "lucide-react";

import { LiveCategoriesPage } from "@/components/admin/live-categories-page";
import { useTenant } from "@/lib/tenant-context";

import {
  CategoryFormDialog,
  draftFromCategory,
  emptyCategoryDraft,
  type CategoryDraft,
} from "@/components/admin/category-form-dialog";
import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { categories as initialCategories, type Category } from "@/data/mock-products";

export default function CategoriesPage() {
  const tenant = useTenant();
  if (tenant.mode === "live") return <LiveCategoriesPage />;
  return <DemoCategoriesPage />;
}

function DemoCategoriesPage() {
  const [rows, setRows] = useState<Category[]>(initialCategories);
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const open = Boolean(draft);

  const nextOrder = useMemo(
    () => rows.reduce((max, item) => Math.max(max, item.order), 0) + 1,
    [rows],
  );

  function save() {
    if (!draft) return;
    if (draft.id) {
      setRows((current) =>
        current.map((item) =>
          item.id === draft.id
            ? {
                ...item,
                name: draft.name,
                status: draft.status,
                available: draft.visible,
                order: draft.order,
              }
            : item,
        ),
      );
      setToast("Categoria atualizada.");
    } else {
      setRows((current) => [
        ...current,
        {
          id: `cat-${Date.now()}`,
          name: draft.name,
          productCount: 0,
          available: draft.visible,
          status: draft.status,
          order: draft.order,
        },
      ]);
      setToast("Categoria salva com sucesso.");
    }
    setDraft(null);
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
          <span className="sr-only">Buscar categoria</span>
          <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
          <input
            placeholder="Buscar categoria"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-3 pl-9 text-sm"
          />
        </label>
        <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm" defaultValue="todas">
          <option value="todas">Todas</option>
        </select>
      </div>

      <p className="mb-4 flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-700">
        <Info className="mt-0.5 size-4 shrink-0" />
        Arraste as categorias para definir a ordem exibida no cardápio.
      </p>

      <div className="overflow-hidden rounded-2xl border border-zinc-100">
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
              {rows.map((category) => (
                <tr key={category.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-zinc-400">
                      <GripVertical className="size-4" />
                      {category.order}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3">{category.productCount} produtos</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <Switch checked={category.available} aria-label="Disponibilidade" />
                      {category.available ? "Disponível" : "Indisponível"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill value={category.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-2 text-zinc-400">
                      <button
                        type="button"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => setDraft(draftFromCategory(category))}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <MoreVertical className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label={`Mostrando ${rows.length} de ${rows.length} categorias`} pages={[1]} />
      </div>

      {draft ? (
        <CategoryFormDialog
          open={open}
          draft={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={save}
        />
      ) : null}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
