"use client";

import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { cancelReasons } from "@/data/mock-order-manager";

export function CancellationDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(cancelReasons[0]);

  return (
    <Dialog open={open} onClose={onClose} title="Cancelar pedido">
      <p className="mb-3 text-sm text-subtle">Selecione o motivo para confirmar o cancelamento.</p>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium">Motivo</span>
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
        >
          {cancelReasons.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="h-10 rounded-xl border px-4 text-sm">
          Voltar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(reason)}
          className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
        >
          Confirmar cancelamento
        </button>
      </div>
    </Dialog>
  );
}
