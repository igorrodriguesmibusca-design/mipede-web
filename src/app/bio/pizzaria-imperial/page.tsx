import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";

import { StoreMark } from "@/components/brand/store-mark";
import { DesktopBioHero } from "@/components/link-bio/desktop-bio-hero";
import { promo } from "@/data/mock-products";
import { store } from "@/data/mock-store";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export default function BioPage() {
  return (
    <>
      <div className="min-h-dvh bg-zinc-50 lg:hidden">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 size-24 overflow-hidden rounded-3xl shadow-sm">
              <StoreMark />
            </div>
            <h1 className="text-2xl font-semibold">{store.name}</h1>
            <p className="mt-1 text-sm font-medium text-success">{store.status}</p>
            <p className="mt-1 text-sm text-subtle">
              {store.eta} · Pedido mínimo {formatCurrency(store.minOrder)}
            </p>
          </header>

          <div className="flex flex-col gap-3">
            <Link
              href={routes.store.onboarding}
              className="flex h-12 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-white"
            >
              Pedir agora
            </Link>
            <span className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-medium">
              <MessageCircle className="size-4 text-brand" />
              WhatsApp
            </span>
            <span className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-medium">
              <MapPin className="size-4 text-brand" />
              Localização
            </span>
            <span className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-medium">
              <span className="flex size-4 items-center justify-center rounded-[5px] border-2 border-brand" aria-hidden="true">
                <span className="size-1.5 rounded-full border border-brand" />
              </span>
              Instagram
            </span>
          </div>

          <Link
            href={routes.store.product("combo-familia")}
            className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={promo.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs font-semibold text-brand">Promoção em destaque</p>
              <p className="mt-1 font-semibold">{promo.productName}</p>
              <p className="text-sm text-subtle">{promo.description}</p>
              <p className="mt-2 font-semibold text-brand">{formatCurrency(promo.price)}</p>
            </div>
          </Link>

          <p className="mt-auto pt-10 text-center text-xs text-zinc-400">Feito com MiPede</p>
        </div>
      </div>
      <DesktopBioHero />
    </>
  );
}
