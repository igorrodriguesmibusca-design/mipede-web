"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";
import { cartCount, cartTotalCents, readCart, type StoreCart, updateCartQuantity } from "@/lib/store-cart";
import { storefrontPath } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export function PublicCartPage({ slug }: { slug: string }) {
  const [cart, setCart] = useState<StoreCart>({ version: 1, slug, items: [] });

  useEffect(() => {
    function refresh() {
      setCart(readCart(slug));
    }
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("mipede-cart-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mipede-cart-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [slug]);

  if (cart.items.length === 0) {
    return (
      <div className="pb-16">
        <PageHeader title="Meu Carrinho" href={storefrontPath(slug)} />
        <EmptyState icon={ShoppingCart} message="Nada por aqui ainda… que tal escolher algo?" />
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader title="Meu Carrinho" href={storefrontPath(slug)} />
      <div className="mx-auto max-w-3xl px-4">
        <p className="sr-only">{cartCount(cart)} itens no carrinho</p>
        <ul className="divide-y divide-zinc-100">
          {cart.items.map((item) => (
            <li key={item.lineId} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm font-semibold text-brand">{formatCurrency(item.totalCents / 100)}</p>
                  {item.complements.length > 0 ? (
                    <div className="mt-2 text-sm text-subtle">
                      {item.complements.map((complement) => (
                        <p key={complement.optionId}>1x {complement.name}</p>
                      ))}
                    </div>
                  ) : null}
                  {item.note ? <p className="mt-1 text-xs text-subtle">{item.note}</p> : null}
                </div>
                <QuantityStepper value={item.quantity} onChange={(value) => setCart(updateCartQuantity(slug, item.lineId, value))} />
              </div>
            </li>
          ))}
        </ul>
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white p-4 md:static md:mt-8 md:p-0">
          <div className="flex h-12 items-center justify-between rounded-2xl bg-brand px-4 text-sm font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(cartTotalCents(cart) / 100)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
