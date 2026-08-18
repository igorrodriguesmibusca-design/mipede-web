"use client";

import { useEffect, useState } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";
import {
  complementListSummary,
  complementRuleSummary,
  groupHasEnoughOptions,
  validateComplementRules,
} from "@/lib/complement-rules";
import { cn, formatCurrency } from "@/lib/utils";

type Option = { id: string; name: string; priceCents: number; active: number };
type Group = {
  id: string;
  name: string;
  required: number;
  minSelect: number;
  maxSelect: number;
  active: number;
  options: Option[];
};

type GroupDraft = {
  id?: string;
  name: string;
  required: boolean;
  minSelect: string;
  maxSelect: string;
  active: boolean;
};

const emptyDraft = (): GroupDraft => ({
  name: "",
  required: false,
  minSelect: "0",
  maxSelect: "1",
  active: true,
});

export function LiveComplementsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<GroupDraft | null>(null);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("0,00");
  const [optionError, setOptionError] = useState<string | null>(null);

  async function load(selectId?: string) {
    const payload = await adminJson<{ groups: Group[] }>("/api/mipede/v1/catalog/complements");
    setGroups(payload.groups ?? []);
    setSelectedId((current) => selectId || current || payload.groups?.[0]?.id || "");
  }

  useEffect(() => {
    void fetch("/api/mipede/v1/catalog/complements", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { groups: [] }))
      .then((payload: { groups?: Group[] }) => {
        setGroups(payload.groups ?? []);
        setSelectedId((current) => current || payload.groups?.[0]?.id || "");
      });
  }, []);

  const selected = groups.find((group) => group.id === selectedId) ?? groups[0];

  function openCreate() {
    setFieldError({});
    setDraft(emptyDraft());
  }

  function openEdit(group: Group) {
    setFieldError({});
    setDraft({
      id: group.id,
      name: group.name,
      required: Boolean(group.required),
      minSelect: String(group.minSelect),
      maxSelect: String(group.maxSelect),
      active: Boolean(group.active),
    });
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.name.trim()) {
      setFieldError({ name: "Informe o nome do grupo." });
      return;
    }
    const invalid = validateComplementRules({
      required: draft.required,
      minSelect: draft.minSelect,
      maxSelect: draft.maxSelect,
    });
    if (invalid) {
      setFieldError({ [invalid.field]: invalid.message });
      return;
    }
    setFieldError({});
    const payload = {
      name: draft.name.trim(),
      required: draft.required,
      minSelect: Number(draft.minSelect),
      maxSelect: Number(draft.maxSelect),
      active: draft.active,
    };
    if (draft.id) {
      await adminJson(`/api/mipede/v1/catalog/complements/${draft.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      setToast("Regras do grupo atualizadas.");
      setSelectedId(draft.id);
    } else {
      const created = await adminJson<{ id: string }>("/api/mipede/v1/catalog/complements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setToast("Grupo criado.");
      setSelectedId(created.id);
    }
    setDraft(null);
    await load();
  }

  return (
    <div>
      <PageHeading
        title="Grupos de complementos"
        description="Monte opções como molhos, adicionais e tamanhos"
        action={<Button onClick={openCreate}>Novo grupo</Button>}
      />
      <div className="grid min-h-[420px] gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-zinc-100 bg-white p-3">
          {groups.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <p className="font-medium">Nenhum grupo criado</p>
              <Button className="mt-3" onClick={openCreate}>
                Novo grupo
              </Button>
            </div>
          ) : (
            <ul className="space-y-1">
              {groups.map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(group.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left",
                      selectedId === group.id ? "bg-brand text-white" : "hover:bg-zinc-50",
                    )}
                  >
                    <span className="block text-sm font-medium">{group.name}</span>
                    <span className={cn("mt-0.5 block text-xs", selectedId === group.id ? "text-white/80" : "text-subtle")}>
                      {complementListSummary(group.options.filter((option) => option.active).length, group.maxSelect)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <section className="rounded-2xl border border-zinc-100 bg-white p-5">
          {!selected ? (
            <p className="text-sm text-subtle">O grupo selecionado aparecerá aqui.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="mt-1 text-sm text-subtle">
                    {complementRuleSummary(Boolean(selected.required), selected.minSelect, selected.maxSelect)}
                    {selected.active ? "" : " • Inativo"}
                  </p>
                  {!groupHasEnoughOptions(selected.minSelect, selected.options.filter((option) => option.active).length) ? (
                    <p className="mt-2 text-sm text-amber-700">
                      Este grupo ainda não tem opções ativas suficientes para o mínimo configurado. Ele não pode ser
                      vinculado a produtos até isso ser resolvido.
                    </p>
                  ) : null}
                </div>
                <Button variant="outline" onClick={() => openEdit(selected)}>
                  Editar grupo
                </Button>
              </div>
              <div className="space-y-2">
                {selected.options.length === 0 ? <p className="text-sm text-subtle">Nenhuma opção neste grupo.</p> : null}
                {selected.options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm">
                    <span>{option.name}</span>
                    <span>{formatCurrency(option.priceCents / 100)}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
                <label className="text-sm font-medium">
                  Nome da opção
                  <Input className="mt-1" value={optionName} onChange={(event) => setOptionName(event.target.value)} placeholder="Ex: Ketchup" />
                </label>
                <label className="text-sm font-medium">
                  Preço adicional
                  <Input className="mt-1" value={optionPrice} onChange={(event) => setOptionPrice(event.target.value)} placeholder="R$ 0,00" />
                </label>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      if (!optionName.trim()) {
                        setOptionError("Informe o nome da opção.");
                        return;
                      }
                      setOptionError(null);
                      void adminJson(`/api/mipede/v1/catalog/complements/${selected.id}/options`, {
                        method: "POST",
                        body: JSON.stringify({ name: optionName.trim(), priceCents: moneyFromInput(optionPrice) }),
                      }).then(() => {
                        setOptionName("");
                        setOptionPrice("0,00");
                        setToast("Opção adicionada.");
                        return load(selected.id);
                      });
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
              {optionError ? <p className="text-sm text-red-600">{optionError}</p> : null}
            </div>
          )}
        </section>
      </div>
      <Dialog open={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? "Editar grupo" : "Novo grupo"}>
        {draft ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Nome do grupo
              <Input className="mt-1" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </label>
            {fieldError.name ? <p className="text-sm text-red-600">{fieldError.name}</p> : null}
            <fieldset>
              <legend className="text-sm font-medium">Tipo de seleção</legend>
              <div className="mt-2 flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="group-type"
                    checked={!draft.required}
                    onChange={() => setDraft({ ...draft, required: false })}
                  />
                  Opcional
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="group-type"
                    checked={draft.required}
                    onChange={() => setDraft({ ...draft, required: true })}
                  />
                  Obrigatório
                </label>
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Quantidade mínima
                <Input className="mt-1" inputMode="numeric" value={draft.minSelect} onChange={(event) => setDraft({ ...draft, minSelect: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">
                Quantidade máxima
                <Input className="mt-1" inputMode="numeric" value={draft.maxSelect} onChange={(event) => setDraft({ ...draft, maxSelect: event.target.value })} />
              </label>
            </div>
            {fieldError.minSelect ? <p className="text-sm text-red-600">{fieldError.minSelect}</p> : null}
            {fieldError.maxSelect ? <p className="text-sm text-red-600">{fieldError.maxSelect}</p> : null}
            <fieldset>
              <legend className="text-sm font-medium">Status</legend>
              <div className="mt-2 flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={draft.active} onChange={() => setDraft({ ...draft, active: true })} />
                  Ativo
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!draft.active} onChange={() => setDraft({ ...draft, active: false })} />
                  Inativo
                </label>
              </div>
            </fieldset>
            <Button onClick={() => void saveDraft()}>{draft.id ? "Salvar regras" : "Criar grupo"}</Button>
          </div>
        ) : null}
      </Dialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
