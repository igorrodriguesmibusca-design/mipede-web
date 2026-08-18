"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export type PlatformMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

export function PlatformActionMenu({ items, label = "Ações" }: { items: PlatformMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-10 right-0 z-20 min-w-44 rounded-xl border border-zinc-100 bg-white p-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full rounded-lg px-3 py-2 text-left text-sm",
                item.destructive ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50",
              )}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
