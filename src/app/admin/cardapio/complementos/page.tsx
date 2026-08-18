"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Search } from "lucide-react";

import { ComplementOptionRow, type OptionDraft } from "@/components/admin/complement-option-row";
import { PageHeading } from "@/components/admin/page-heading";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { addonGroups, products } from "@/data/mock-products";
import { cn } from "@/lib/utils";

type GroupDraft = {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  productCount: number;
  active: boolean;
  options: OptionDraft[];
  linked: string[];
};

function fromMock(): GroupDraft[] {
  return addonGroups.map((group) => ({
    id: group.id,
    name: group.name,
    required: group.required,
    min: group.min,
    max: group.max,
    productCount: group.productCount,
    active: true,
    linked: products.slice(0, group.productCount > 8 ? 3 : 2).map((item) => item.id),
    options: group.options.map((option) => ({
      id: option.id,
      name: option.name,
      price: option.price,
      available: true,
    })),
  }));
}

export default function ComplementsPage() {
  const [groups, setGroups] = useState<GroupDraft[]>(fromMock);
  const [selectedId, setSelectedId] = useState(groups[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    required: false,
    min: 0,
    max: 1,
    active: true,
    linked: [] as string[],
  });

  const visible = groups.filter((group) =>
    group.name.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = groups.find((group) => group.id === selectedId) ?? groups[0];

  function updateSelected(patch: Partial<GroupDraft>) {
    if (!selected) return;
    setGroups((current) =>
      current.map((group) => (group.id === selected.id ? { ...group, ...patch } : group)),
    );
  }

  const linkedCount = selected?.linked.length ?? 0;

  const productOptions = useMemo(() => products.map((item) => ({ id: item.id, name: item.name })), []);

  return (
    <div>
      <PageHeading
        title="Grupos de complementos"
        description="Configure adicionais e escolhas dos produtos"
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
          >
            Novo grupo
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[30%_70%]">
        <aside className="rounded-2xl border border-zinc-100 p-4">
          <label className="relative mb-3 block">
            <span className="sr-only">Buscar grupo</span>
            <Search className="absolute top-3 left-3 size-4 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar grupo"
              className="h-10 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm"
            />
          </label>
          <ul className="space-y-2">
            {visible.map((group) => (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(group.id)}
                  className={cn(
                    "flex w-full items-start justify-between rounded-xl border px-3 py-3 text-left",
                    group.id === selected?.id ? "border-brand bg-orange-50" : "border-zinc-100",
                  )}
                >
                  <span>
                    <span className={cn("block font-medium", group.id === selected?.id && "text-brand")}>
                      {group.name}
                    </span>
                    <span className="text-xs text-subtle">
                      {group.options.length} opções · {group.productCount} produtos
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={group.active ? "text-[11px] text-success" : "text-[11px] text-zinc-400"}>
                      {group.active ? "Ativo" : "Pausado"}
                    </span>
                    <MoreVertical className="size-4 text-zinc-300" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {selected ? (
          <section className="rounded-2xl border border-zinc-100 p-4">
            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label>
                <span className="mb-1 block text-sm font-medium">Nome do grupo</span>
                <Input
                  value={selected.name}
                  onChange={(event) => updateSelected({ name: event.target.value })}
                />
              </label>
              <div>
                <span className="mb-1 block text-sm font-medium">Escolha obrigatória</span>
                <Switch
                  checked={selected.required}
                  aria-label="Escolha obrigatória"
                  onClick={() => updateSelected({ required: !selected.required })}
                />
              </div>
              <label>
                <span className="mb-1 block text-sm font-medium">Quantidade mínima</span>
                <Input
                  type="number"
                  value={selected.min}
                  onChange={(event) => updateSelected({ min: Number(event.target.value) })}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Quantidade máxima</span>
                <Input
                  type="number"
                  value={selected.max}
                  onChange={(event) => updateSelected({ max: Number(event.target.value) })}
                />
              </label>
            </div>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span>Status do grupo</span>
                <Switch
                  checked={selected.active}
                  aria-label="Status do grupo"
                  onClick={() => updateSelected({ active: !selected.active })}
                />
              </div>
              <p className="text-xs text-subtle">{linkedCount} produtos vinculados</p>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Opções</h3>
              <button
                type="button"
                onClick={() =>
                  updateSelected({
                    options: [
                      ...selected.options,
                      {
                        id: `opt-${Date.now()}`,
                        name: "",
                        price: 0,
                        available: true,
                        editing: true,
                      },
                    ],
                  })
                }
                className="h-9 rounded-lg border border-brand px-3 text-sm font-semibold text-brand"
              >
                Adicionar opção
              </button>
            </div>
            <div className="mb-2 hidden grid-cols-[24px_1fr_140px_88px_auto] gap-3 px-3 text-xs text-subtle md:grid">
              <span />
              <span>Nome da opção</span>
              <span>Preço adicional</span>
              <span>Disponível</span>
              <span className="text-right">Ações</span>
            </div>
            <div className="space-y-2">
              {selected.options.map((option) => (
                <ComplementOptionRow
                  key={option.id}
                  option={option}
                  onChange={(next) =>
                    updateSelected({
                      options: selected.options.map((item) => (item.id === option.id ? next : item)),
                    })
                  }
                  onRemove={() =>
                    updateSelected({
                      options: selected.options.filter((item) => item.id !== option.id),
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setToast("Alterações salvas localmente.")}
                className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
              >
                Salvar alterações
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <Dialog open={creating} onClose={() => setCreating(false)} title="Novo grupo">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nome</span>
            <Input
              value={newGroup.name}
              onChange={(event) => setNewGroup({ ...newGroup, name: event.target.value })}
            />
          </label>
          <div className="flex items-center justify-between">
            <span className="text-sm">Obrigatório</span>
            <Switch
              checked={newGroup.required}
              aria-label="Obrigatório"
              onClick={() => setNewGroup({ ...newGroup, required: !newGroup.required })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={newGroup.min}
              onChange={(event) => setNewGroup({ ...newGroup, min: Number(event.target.value) })}
            />
            <Input
              type="number"
              value={newGroup.max}
              onChange={(event) => setNewGroup({ ...newGroup, max: Number(event.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Status ativo</span>
            <Switch
              checked={newGroup.active}
              aria-label="Status ativo"
              onClick={() => setNewGroup({ ...newGroup, active: !newGroup.active })}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Produtos vinculados</p>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {productOptions.map((item) => {
                const checked = newGroup.linked.includes(item.id);
                return (
                  <label key={item.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setNewGroup({
                          ...newGroup,
                          linked: checked
                            ? newGroup.linked.filter((id) => id !== item.id)
                            : [...newGroup.linked, item.id],
                        })
                      }
                    />
                    {item.name}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className="h-10 rounded-xl border px-4 text-sm">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newGroup.name.trim()) return;
                const id = `group-${Date.now()}`;
                setGroups((current) => [
                  ...current,
                  {
                    id,
                    name: newGroup.name,
                    required: newGroup.required,
                    min: newGroup.min,
                    max: newGroup.max,
                    productCount: newGroup.linked.length,
                    active: newGroup.active,
                    options: [],
                    linked: newGroup.linked,
                  },
                ]);
                setSelectedId(id);
                setCreating(false);
                setToast("Grupo criado.");
              }}
              className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
            >
              Criar grupo
            </button>
          </div>
        </div>
      </Dialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
