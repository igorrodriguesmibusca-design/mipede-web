import { GripVertical, Info, MoreVertical, Pencil, Search } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { categories } from "@/data/mock-products";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeading
        title="Categorias"
        description="Organize as seções do seu cardápio"
        action={
          <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Nova categoria
          </span>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar categoria</span>
          <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
          <input
            readOnly
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
                {["Ordem", "Categoria", "Produtos", "Disponibilidade", "Status", "Ações"].map(
                  (head) => (
                    <th key={head} className="px-4 py-3 font-medium">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
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
                      <Pencil className="size-4" />
                      <MoreVertical className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="Mostrando 5 de 5 categorias" pages={[1]} />
      </div>
    </div>
  );
}
