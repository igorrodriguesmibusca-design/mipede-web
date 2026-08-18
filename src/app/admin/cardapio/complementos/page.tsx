import { GripVertical, Pencil, Search, Trash2 } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Switch } from "@/components/ui/switch";
import { addonGroups } from "@/data/mock-products";
import { cn } from "@/lib/utils";

export default function AddonsPage() {
  const selected = addonGroups.find((group) => group.id === "bordas") ?? addonGroups[0];

  return (
    <div>
      <PageHeading
        title="Complementos"
        description="Configure adicionais e escolhas dos produtos"
        action={
          <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Novo grupo
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-zinc-100 p-4">
          <h2 className="mb-3 font-semibold">Grupos de complementos</h2>
          <label className="relative mb-3 block">
            <span className="sr-only">Buscar grupo</span>
            <Search className="absolute top-3 left-3 size-4 text-zinc-400" />
            <input
              readOnly
              placeholder="Buscar grupo"
              className="h-10 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm"
            />
          </label>
          <ul className="space-y-2">
            {addonGroups.map((group) => (
              <li
                key={group.id}
                className={cn(
                  "rounded-xl border px-3 py-3",
                  group.id === selected.id
                    ? "border-brand bg-orange-50"
                    : "border-zinc-100",
                )}
              >
                <p className={cn("font-medium", group.id === selected.id && "text-brand")}>
                  {group.name}
                </p>
                <p className="text-xs text-subtle">
                  {group.options.length} opções · Vinculado a {group.productCount} produtos
                </p>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-2xl border border-zinc-100 p-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">Editar grupo: {selected.name}</h2>
            <p className="text-xs text-subtle">Vinculado a {selected.productCount} produtos</p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <label className="md:col-span-2">
              <span className="mb-1 block text-sm font-medium">Nome do grupo</span>
              <input
                readOnly
                defaultValue={selected.name}
                className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </label>
            <div>
              <span className="mb-1 block text-sm font-medium">Escolha obrigatória</span>
              <Switch checked={selected.required} aria-label="Escolha obrigatória" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="mb-1 block text-sm font-medium">Mínimo</span>
                <input
                  readOnly
                  defaultValue={selected.min}
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Máximo</span>
                <input
                  readOnly
                  defaultValue={selected.max}
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
                />
              </label>
            </div>
          </div>

          <h3 className="mb-3 font-semibold">Opções</h3>
          <ul className="space-y-3">
            {selected.options.map((option) => (
              <li
                key={option.id}
                className="grid items-center gap-3 rounded-xl border border-zinc-100 p-3 md:grid-cols-[auto_1fr_120px_auto_auto]"
              >
                <GripVertical className="size-4 text-zinc-300" />
                <input
                  readOnly
                  defaultValue={option.name}
                  className="h-10 rounded-lg border border-zinc-200 px-3 text-sm"
                />
                <label>
                  <span className="mb-1 block text-[11px] text-subtle">Preço adicional (R$)</span>
                  <input
                    readOnly
                    defaultValue={option.price.toFixed(2).replace(".", ",")}
                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                  />
                </label>
                <span className="flex items-center gap-2 text-sm">
                  <Switch checked aria-label={`Disponível ${option.name}`} />
                </span>
                <span className="flex gap-2 text-zinc-400">
                  <Pencil className="size-4" />
                  <Trash2 className="size-4 text-red-400" />
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-3">
            <span className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm">
              Cancelar
            </span>
            <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
              Salvar alterações
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
