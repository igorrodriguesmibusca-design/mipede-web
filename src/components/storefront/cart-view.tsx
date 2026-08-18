import { ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { PrimaryCta } from "@/components/storefront/primary-cta";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";
import { StoreHeader } from "@/components/storefront/store-header";
import { SuggestedRail } from "@/components/storefront/suggested-rail";
import { cartItems, cartTotal } from "@/data/mock-orders";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export function CartView({ empty = false }: { empty?: boolean }) {
  return (
    <div className="pb-28 md:pb-10">
      <div className="hidden md:block">
        <StoreHeader compact />
      </div>
      <PageHeader title={empty ? "Meu Carrinho" : "Meu Carrinho"} href={routes.store.home} />

      {empty ? (
        <>
          <EmptyState
            icon={ShoppingCart}
            message="Nada por aqui ainda… que tal escolher algo?"
          />
          <div className="px-4">
            <SuggestedRail title="Adicione ao seu carrinho" />
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-3xl px-4">
          <ul className="divide-y divide-zinc-100">
            {cartItems.map((item) => (
              <li key={item.id} className="py-4">
                <div className="flex items-start gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm font-semibold text-brand">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <QuantityStepper value={item.quantity} />
                    </div>
                  </div>
                </div>
                {item.extras.length > 0 ? (
                  <div className="mt-3 text-sm">
                    <p className="font-semibold">Adicionais:</p>
                    {item.extras.map((extra) => (
                      <div
                        key={extra.name}
                        className="flex justify-between text-subtle"
                      >
                        <span>1x {extra.name}</span>
                        <span>{formatCurrency(extra.price)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <SuggestedRail title="Peça também" />
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 bg-white p-4 md:static md:mt-8 md:p-0">
            <PrimaryCta
              href={routes.store.identifyFilled}
              label="Avançar"
              value={formatCurrency(cartTotal)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
