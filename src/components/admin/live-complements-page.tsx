"use client";

import { useEffect, useState } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string; priceCents: number; active: number };
type Group = { id: string; name: string; required: number; minSelect: number; maxSelect: number; active: number; options: Option[] };

export function LiveComplementsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [required, setRequired] = useState(false);
  const [minSelect, setMinSelect] = useState(0);
  const [maxSelect, setMaxSelect] = useState(1);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("0");

  async function load() {
    const payload = await adminJson<{ groups: Group[] }>("/api/mipede/v1/catalog/complements");
    setGroups(payload.groups ?? []);
    setSelectedId((current) => current || payload.groups?.[0]?.id || "");
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

  async function createGroup() {
    if (!name.trim()) return;
    const payload = await adminJson<{ id: string }>("/api/mipede/v1/catalog/complements", {
      method: "POST",
      body: JSON.stringify({ name, required, minSelect: required ? Math.max(minSelect, 1) : minSelect, maxSelect: Math.max(maxSelect, minSelect, 1) }),
    });
    setCreating(false);
    setName("");
    setSelectedId(payload.id);
    setToast("Grupo criado.");
    await load();
  }

  return (
    <div>
      <PageHeading
        title="Grupos de complementos"
        description="Monte opções como molhos, adicionais e tamanhos"
        action={
          <Button onClick={() => setCreating(true)}>Novo grupo</Button>
        }
      />
      <div className="grid min-h-[420px] gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-zinc-100 bg-white p-3">
          {groups.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <p className="font-medium">Nenhum grupo criado</p>
              <Button className="mt-3" onClick={() => setCreating(true)}>Novo grupo</Button>
            </div>
          ) : (
            <ul className="space-y-1">
              {groups.map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(group.id)}
                    className={cn("w-full rounded-xl px-3 py-2 text-left text-sm", selectedId === group.id ? "bg-brand text-white" : "hover:bg-zinc-50")}
                  >
                    {group.name}
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <span className="text-xs text-subtle">{selected.required ? "Obrigatório" : "Opcional"}</span>
              </div>
              <div className="space-y-2">
                {selected.options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm">
                    <span>{option.name}</span>
                    <span>{(option.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                <Input value={optionName} onChange={(event) => setOptionName(event.target.value)} placeholder="Nome da opção" />
                <Input value={optionPrice} onChange={(event) => setOptionPrice(event.target.value)} placeholder="0,00" />
                <Button
                  onClick={() =>
                    void adminJson(`/api/mipede/v1/catalog/complements/${selected.id}/options`, {
                      method: "POST",
                      body: JSON.stringify({ name: optionName, priceCents: moneyFromInput(optionPrice) }),
                    }).then(() => {
                      setOptionName("");
                      setToast("Opção adicionada.");
                      return load();
                    })
                  }
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
      <Dialog open={creating} onClose={() => setCreating(false)} title="Novo grupo">
        <div className="space-y-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do grupo" />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={required} onClick={() => setRequired((value) => !value)} /> Obrigatório
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={minSelect} onChange={(event) => setMinSelect(Number(event.target.value))} />
            <Input type="number" value={maxSelect} onChange={(event) => setMaxSelect(Number(event.target.value))} />
          </div>
          <Button onClick={() => void createGroup()}>Criar grupo</Button>
        </div>
      </Dialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
