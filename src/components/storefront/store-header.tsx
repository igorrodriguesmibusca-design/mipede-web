import { Clock3, MapPin, Share2 } from "lucide-react";

import { MipedeMark } from "@/components/brand/mipede-mark";
import { store } from "@/data/mock-store";
import { formatCurrency } from "@/lib/utils";

type StoreHeaderProps = {
  compact?: boolean;
};

export function StoreHeader({ compact = false }: StoreHeaderProps) {
  return (
    <header className="relative">
      {!compact ? (
        <div className="relative h-36 overflow-hidden bg-zinc-900 md:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mock/hero.jpg"
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
          <div className="absolute top-3 right-3 flex gap-2 md:top-5 md:right-8">
            <HeaderIcon label="WhatsApp" />
            <HeaderIcon label="Compartilhar" share />
          </div>
        </div>
      ) : (
        <div className="h-10 bg-linear-to-r from-orange-600 to-brand" />
      )}

      <div className={compact ? "px-4 md:px-8" : "px-4 md:-mt-8 md:px-8"}>
        <div
          className={
            compact
              ? "flex items-center justify-between gap-3 py-3"
              : "relative -mt-10 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm md:mt-0 md:rounded-2xl"
          }
        >
          {!compact ? (
            <div className="absolute -top-3 right-4 left-4 flex items-center justify-between gap-2 rounded-xl bg-linear-to-r from-orange-600 to-brand px-3 py-1.5 text-[11px] font-medium text-white md:static md:mb-3 md:rounded-lg">
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {store.hoursLabel}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{store.addressShort}</span>
              </span>
            </div>
          ) : (
            <div className="hidden" />
          )}

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand">
              <MipedeMark className="size-8" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">{store.name}</p>
              <p className="truncate text-sm">
                <span className="font-medium text-success">{store.status}</span>
                <span className="text-subtle">
                  {" "}
                  · Pedido mínimo {formatCurrency(store.minOrder)}
                </span>
              </p>
            </div>
          </div>

          {compact ? (
            <div className="flex shrink-0 gap-2">
              <HeaderIcon label="WhatsApp" />
              <HeaderIcon label="Compartilhar" share />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function HeaderIcon({ label, share = false }: { label: string; share?: boolean }) {
  return (
    <span
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full bg-brand text-white"
    >
      {share ? <Share2 className="size-4" /> : <WhatsAppIcon />}
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M20 11.5A8.5 8.5 0 0 1 7.4 18.7L4 20l1.4-3.3A8.5 8.5 0 1 1 20 11.5Zm-8.5 7a7 7 0 1 0-6-3.4l.2.4-.8 2 2.1-.8.3.2a7 7 0 0 0 4.2 1.6Zm3.9-5.2c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.5.6c-.1.1-.3.2-.5.1s-1-.4-1.9-1.2c-.7-.6-1.2-1.4-1.3-1.6s0-.4.1-.5l.4-.4c.1-.1.1-.3.2-.4 0-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.5.6 1.8.5 2.2.5.4 0 1.1-.4 1.3-.9.2-.4.2-.8.1-.9 0-.1-.2-.1-.4-.2Z" />
    </svg>
  );
}
