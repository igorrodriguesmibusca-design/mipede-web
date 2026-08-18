import Link from "next/link";

import { StatusBadge } from "@/components/storefront/status-badge";
import { Card } from "@/components/ui/card";
import type { Order } from "@/data/mock-orders";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export function OrderCard({ order, fullHref }: { order: Order; fullHref?: string }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Pedido {order.number}</p>
          <p className="text-xs text-subtle">Em {order.datetime}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.name}`} className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold uppercase">
            {item.quantity}x {item.name}
          </div>
        ))}
      </div>

      {order.items[0]?.extras.length ? (
        <div className="mt-3 text-sm">
          <p className="font-semibold">Adicionais:</p>
          {order.items[0].extras.map((extra) => (
            <p key={extra} className="text-subtle">
              1x {extra}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-medium">Total</span>
        <span className="font-semibold text-brand">{formatCurrency(order.total)}</span>
      </div>

      <Link
        href={fullHref ?? routes.store.order(order.id)}
        className="mt-4 flex h-11 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
      >
        Detalhes do Pedido
      </Link>
      <Link
        href={routes.store.home}
        className="mt-2 flex h-11 items-center justify-center rounded-xl border border-brand text-sm font-semibold text-brand"
      >
        Pedir Novamente
      </Link>
    </Card>
  );
}
