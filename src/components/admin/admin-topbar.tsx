import { Bell, Menu, Share2 } from "lucide-react";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { store } from "@/data/mock-store";

export function AdminTopbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-100 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-lg text-ink lg:pointer-events-none"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
        <MipedeLogo />
        <span className="hidden h-8 w-px bg-zinc-200 sm:block" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold">{store.name}</p>
          <p className="flex items-center gap-1 text-xs font-medium text-success">
            {store.status}
            <span className="size-1.5 rounded-full bg-success" />
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          aria-label="Notificações"
          className="relative flex size-10 items-center justify-center rounded-full border border-zinc-200"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-brand" />
        </span>
        <span
          aria-label="Compartilhar"
          className="flex size-10 items-center justify-center rounded-full border border-zinc-200"
        >
          <Share2 className="size-4" />
        </span>
      </div>
    </header>
  );
}
