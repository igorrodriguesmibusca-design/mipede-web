"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { adminJson } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export function MediaSlot({
  label,
  hint,
  aspectClass,
  valueUrl,
  focus,
  onUploaded,
  onRemove,
  onFocus,
  onRestoreFocus,
}: {
  label: string;
  hint: string;
  aspectClass: string;
  valueUrl?: string | null;
  focus?: { x: number; y: number };
  onUploaded: (mediaId: string, url: string) => void;
  onRemove: () => void;
  onFocus?: (focus: { x: number; y: number }) => void;
  onRestoreFocus?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  async function upload(file: File) {
    if (pending) return;
    setError(null);
    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2 MB.");
      return;
    }
    setPending(true);
    setLocalPreview(URL.createObjectURL(file));
    const body = new FormData();
    body.append("file", file);
    try {
      const payload = await adminJson<{ id: string; url: string }>("/api/mipede/v1/media", { method: "POST", body });
      onUploaded(payload.id, payload.url);
    } catch (item) {
      setError(item instanceof Error ? item.message : "Não foi possível enviar a imagem.");
    } finally {
      setPending(false);
    }
  }

  const preview = localPreview || valueUrl;

  return (
    <article className="rounded-2xl border border-zinc-100 bg-white p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-1 text-xs text-subtle">{hint} JPEG, PNG ou WebP. Máx. 2 MB.</p>
      <div
        className={cn("relative mt-3 overflow-hidden rounded-xl border border-dashed border-zinc-200 bg-zinc-50", aspectClass)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void upload(file);
        }}
        onClick={(event) => {
          if (!onFocus || !preview) return;
          const box = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
          onFocus({
            x: Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)),
            y: Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)),
          });
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-full w-full object-cover"
            style={focus ? { objectPosition: `${focus.x * 100}% ${focus.y * 100}%` } : undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-subtle">
            Arraste uma imagem ou selecione um arquivo
          </div>
        )}
        {pending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium">
            Enviando...
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => inputRef.current?.click()}>
          {preview ? "Substituir" : "Enviar"}
        </Button>
        {preview ? (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            Remover
          </Button>
        ) : null}
        {onRestoreFocus ? (
          <Button size="sm" variant="ghost" onClick={onRestoreFocus}>
            Restaurar enquadramento
          </Button>
        ) : null}
      </div>
      {onFocus ? <p className="mt-2 text-xs text-subtle">Clique na prévia para ajustar o ponto de foco.</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
