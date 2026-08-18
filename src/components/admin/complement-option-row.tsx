"use client";

import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

export type OptionDraft = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  editing?: boolean;
};

export function ComplementOptionRow({
  option,
  onChange,
  onRemove,
}: {
  option: OptionDraft;
  onChange: (option: OptionDraft) => void;
  onRemove: () => void;
}) {
  if (option.editing) {
    return (
      <div className="grid items-center gap-3 rounded-xl border border-brand/30 bg-orange-50/40 p-3 md:grid-cols-[24px_1fr_140px_88px_auto]">
        <GripVertical className="size-4 text-zinc-300" />
        <input
          value={option.name}
          onChange={(event) => onChange({ ...option, name: event.target.value })}
          placeholder="Nome da opção"
          className="h-10 rounded-lg border border-zinc-200 px-3 text-sm"
        />
        <input
          value={option.price.toFixed(2).replace(".", ",")}
          onChange={(event) =>
            onChange({ ...option, price: Number(event.target.value.replace(",", ".")) || 0 })
          }
          className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"
        />
        <Switch
          checked={option.available}
          aria-label="Disponível"
          onClick={() => onChange({ ...option, available: !option.available })}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...option, editing: false })}
            className="h-9 rounded-lg bg-brand px-3 text-xs font-semibold text-white"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="h-9 rounded-lg border border-zinc-200 px-3 text-xs"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[68px] items-center gap-3 rounded-xl border border-zinc-100 p-3 md:grid-cols-[24px_1fr_140px_88px_auto]">
      <GripVertical className="size-4 text-zinc-300" />
      <p className="text-sm font-medium">{option.name}</p>
      <p className="w-[140px] text-sm">
        {option.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
      <Switch checked={option.available} aria-label={`Disponível ${option.name}`} />
      <div className="flex w-[88px] justify-end gap-2 text-zinc-400">
        <button type="button" aria-label={`Editar ${option.name}`} onClick={() => onChange({ ...option, editing: true })}>
          <Pencil className="size-4" />
        </button>
        <button type="button" aria-label={`Excluir ${option.name}`} onClick={onRemove}>
          <Trash2 className="size-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
