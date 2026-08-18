"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function PlatformConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive = false,
  requiresReason = false,
  reasonLabel = "Motivo",
  pending = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  requiresReason?: boolean;
  reasonLabel?: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    setReason("");
    setError(null);
    onClose();
  }

  async function confirm() {
    if (requiresReason && reason.trim().length < 3) {
      setError("Informe um motivo com pelo menos 3 caracteres.");
      return;
    }
    await onConfirm(requiresReason ? reason.trim() : undefined);
    setReason("");
    setError(null);
  }

  return (
    <Dialog open={open} onClose={close} title={title} className="sm:max-w-md">
      <p className="text-sm text-subtle">{description}</p>
      {requiresReason ? (
        <label className="mt-4 block text-sm font-medium">
          {reasonLabel}
          <Input
            className="mt-2"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
            placeholder="Descreva o motivo"
          />
        </label>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={close} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={destructive ? "destructive" : "default"}
          disabled={pending}
          onClick={() => void confirm()}
        >
          {pending ? "Aguarde..." : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
