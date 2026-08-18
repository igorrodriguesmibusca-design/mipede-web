"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Share2 } from "lucide-react";

import { MipedeMark } from "@/components/brand/mipede-mark";
import { storefrontPath } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

type PublicMenu = {
  comingSoon?: boolean;
  emptyMessage?: string;
  store: {
    name: string;
    slug: string;
    description?: string | null;
    whatsapp?: string | null;
    hoursLabel?: string | null;
    address?: string | null;
    city?: string | null;
    minOrderCents?: number;
    isOpen?: boolean;
    logoUrl?: string | null;
    coverUrl?: string | null;
    status?: string;
  };
  categories: Array<{ id: string; name: string }>;
  products: Array<{
    id: string;
    categoryId: string;
    name: string;
    description?: string | null;
    priceCents: number;
    promoPriceCents?: number | null;
    imageUrl?: string | null;
  }>;
};

export function PublicStoreMenu({ slug }: { slug: string }) {
  const [menu, setMenu] = useState<PublicMenu | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/mipede/v1/public/menu/${slug}`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: PublicMenu | null) => {
        if (!payload) {
          setError("Cardápio não encontrado.");
          return;
        }
        setMenu(payload);
      });
  }, [slug]);

  if (error) {
    return <div className="px-4 py-16 text-center text-sm text-subtle">{error}</div>;
  }
  if (!menu) {
    return <div className="px-4 py-16 text-center text-sm text-subtle">Carregando cardápio...</div>;
  }

  if (menu.comingSoon) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{menu.store.name}</h1>
        <p className="mt-2 text-sm text-subtle">Em breve. Este cardápio ainda não está disponível ao público.</p>
      </div>
    );
  }

  const store = menu.store;
  const products = menu.products ?? [];

  return (
    <div>
      <header className="relative">
        <div className="relative h-36 overflow-hidden bg-zinc-900 md:h-52">
          {store.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.coverUrl} alt="" className="h-full w-full object-cover opacity-90" />
          ) : (
            <div className="h-full w-full bg-linear-to-r from-orange-600 to-brand" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
        </div>
        <div className="px-4 md:-mt-8 md:px-8">
          <div className="relative -mt-10 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm md:mt-0">
            {store.hoursLabel || store.address ? (
              <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-linear-to-r from-orange-600 to-brand px-3 py-1.5 text-[11px] font-medium text-white">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {store.hoursLabel ?? "Horário não informado"}
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{store.address || [store.city].filter(Boolean).join(" ") || "Endereço não informado"}</span>
                </span>
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand">
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <MipedeMark className="size-8" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{store.name}</p>
                <p className="text-sm">
                  <span className={store.isOpen ? "font-medium text-success" : "font-medium text-amber-600"}>
                    {store.isOpen ? "Aberto" : "Em preparação"}
                  </span>
                  {store.minOrderCents ? (
                    <span className="text-subtle"> · Pedido mínimo {formatCurrency(store.minOrderCents / 100)}</span>
                  ) : null}
                </p>
              </div>
              {store.whatsapp ? (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                  className="ml-auto flex size-9 items-center justify-center rounded-full bg-brand text-white"
                  aria-label="WhatsApp"
                >
                  <Share2 className="size-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-8">
        {menu.categories.length > 0 ? (
          <CategoryPills items={menu.categories} />
        ) : null}
        {products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
            <p className="font-medium">{menu.emptyMessage ?? "Este cardápio ainda não possui itens disponíveis."}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`${storefrontPath(slug)}/produto/${product.id}`}
                className="block rounded-2xl border border-zinc-100 bg-white p-3 text-left hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" className="mb-3 h-32 w-full rounded-xl object-cover" />
                ) : null}
                <h2 className="font-medium">{product.name}</h2>
                {product.description ? <p className="mt-1 line-clamp-2 text-sm text-subtle">{product.description}</p> : null}
                <p className="mt-2 font-semibold">
                  {product.promoPriceCents ? (
                    <>
                      <span className="mr-2 text-xs text-zinc-400 line-through">{formatCurrency(product.priceCents / 100)}</span>
                      {formatCurrency(product.promoPriceCents / 100)}
                    </>
                  ) : (
                    formatCurrency(product.priceCents / 100)
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryPills({ items }: { items: Array<{ id: string; name: string }> }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <span key={item.id} className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm">
          {item.name}
        </span>
      ))}
    </div>
  );
}
