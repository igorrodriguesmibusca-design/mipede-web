"use client";

import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/data/mock-products";

export type CategoryDraft = {
  id?: string;
  name: string;
  description: string;
  status: "Ativa" | "Pausada";
  availability: "sempre" | "horario";
  days: string[];
  start: string;
  end: string;
  order: number;
  visible: boolean;
};

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function emptyCategoryDraft(order: number): CategoryDraft {
  return {
    name: "",
    description: "",
    status: "Ativa",
    availability: "sempre",
    days: [...weekDays],
    start: "18:00",
    end: "23:00",
    order,
    visible: true,
  };
}

export function draftFromCategory(category: Category): CategoryDraft {
  return {
    id: category.id,
    name: category.name,
    description: "",
    status: category.status,
    availability: "sempre",
    days: [...weekDays],
    start: "18:00",
    end: "23:00",
    order: category.order,
    visible: category.available,
  };
}

export function CategoryFormDialog({
  open,
  draft,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  draft: CategoryDraft;
  onChange: (draft: CategoryDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [error, setError] = useState("");

  function submit() {
    if (!draft.name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }
    setError("");
    onSave();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={draft.id ? "Editar categoria" : "Nova categoria"}
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nome da categoria *</span>
          <Input
            value={draft.name}
            onChange={(event) => onChange({ ...draft, name: event.target.value })}
            aria-invalid={Boolean(error)}
          />
          {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Descrição</span>
          <textarea
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
            className="h-20 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium">Status</span>
            <select
              value={draft.status}
              onChange={(event) =>
                onChange({ ...draft, status: event.target.value as CategoryDraft["status"] })
              }
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            >
              <option value="Ativa">Ativa</option>
              <option value="Pausada">Pausada</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Disponibilidade</span>
            <select
              value={draft.availability}
              onChange={(event) =>
                onChange({
                  ...draft,
                  availability: event.target.value as CategoryDraft["availability"],
                })
              }
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            >
              <option value="sempre">Sempre disponível</option>
              <option value="horario">Horário programado</option>
            </select>
          </label>
        </div>
        {draft.availability === "horario" ? (
          <>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const active = draft.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...draft,
                        days: active
                          ? draft.days.filter((item) => item !== day)
                          : [...draft.days, day],
                      })
                    }
                    className={
                      active
                        ? "rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white"
                        : "rounded-lg bg-zinc-100 px-2.5 py-1 text-xs"
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-sm font-medium">Horário inicial</span>
                <Input
                  type="time"
                  value={draft.start}
                  onChange={(event) => onChange({ ...draft, start: event.target.value })}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Horário final</span>
                <Input
                  type="time"
                  value={draft.end}
                  onChange={(event) => onChange({ ...draft, end: event.target.value })}
                />
              </label>
            </div>
          </>
        ) : null}
        <label>
          <span className="mb-1 block text-sm font-medium">Ordem de exibição</span>
          <Input
            type="number"
            value={draft.order}
            onChange={(event) => onChange({ ...draft, order: Number(event.target.value) })}
          />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Exibir no cardápio</span>
          <Switch
            checked={draft.visible}
            aria-label="Exibir no cardápio"
            onClick={() => onChange({ ...draft, visible: !draft.visible })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-zinc-200 px-4 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
          >
            Salvar categoria
          </button>
        </div>
      </div>
    </Dialog>
  );
}
