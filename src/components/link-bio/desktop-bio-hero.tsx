import Link from "next/link";
import { Clock3, MapPin, MessageCircle, Share2 } from "lucide-react";

import { StoreMark } from "@/components/brand/store-mark";
import { DesktopBannerCarousel } from "@/components/link-bio/desktop-banner-carousel";
import { bioHighlights } from "@/data/mock-analytics";
import { store } from "@/data/mock-store";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export function DesktopBioHero() {
  return (
    <div className="hidden min-h-dvh bg-zinc-50 lg:block">
      <div className="mx-auto max-w-[1240px] px-8 py-10">
        <header className="mb-8 flex items-center justify-between gap-6 rounded-3xl border border-zinc-100 bg-white p-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="size-16 overflow-hidden rounded-2xl">
              <StoreMark />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{store.name}</h1>
                <span className="text-sm font-medium text-success">{store.status}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-subtle">
                <span>{store.eta}</span>
                <span>Pedido mínimo {formatCurrency(store.minOrder)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" />
                  {store.hoursLabel}
                </span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm">
              <Share2 className="size-4" />
              Compartilhar
            </span>
            <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white">
              <MessageCircle className="size-4" />
              WhatsApp
            </span>
          </div>
        </header>

        <div className="grid grid-cols-[1.65fr_0.85fr] gap-6">
          <DesktopBannerCarousel />
          <aside className="rounded-3xl border border-zinc-100 bg-white p-6">
            <h2 className="text-lg font-semibold">Peça agora</h2>
            <p className="mt-1 text-sm text-subtle">
              Entrega própria · {store.deliveryMode}
            </p>
            <Link
              href={routes.store.home}
              className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-white"
            >
              Pedir agora
            </Link>
            <div className="mt-3 grid gap-2">
              <span className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm">
                <MessageCircle className="size-4 text-brand" />
                WhatsApp
              </span>
              <span className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm">
                <MapPin className="size-4 text-brand" />
                Localização
              </span>
              <span className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm">
                Instagram
              </span>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <p className="font-medium">Informações de entrega</p>
              <p className="text-subtle">{store.address}</p>
              <p className="text-subtle">Pedido mínimo {formatCurrency(store.minOrder)}</p>
              <p className="text-subtle">Atendimento: entrega, retirada e consumo no local</p>
            </div>
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Destaques da Pizzaria</h2>
          <div className="grid grid-cols-3 gap-4">
            {bioHighlights.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="overflow-hidden rounded-2xl border border-zinc-100 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-subtle">{item.text}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand">{item.value}</span>
                    <span className="text-sm font-semibold text-brand">Pedir agora</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-zinc-400">Feito com MiPede</p>
      </div>
    </div>
  );
}
