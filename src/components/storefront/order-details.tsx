import { Bike, CreditCard, Package, Route } from "lucide-react";

import { BottomNav } from "@/components/storefront/bottom-nav";
import { PageHeader } from "@/components/storefront/page-header";
import { StatusBadge } from "@/components/storefront/status-badge";
import { Card } from "@/components/ui/card";
import type { Order } from "@/data/mock-orders";
import { routes } from "@/lib/routes";
import { cn, formatCurrency } from "@/lib/utils";

export function OrderDetails({
  order,
  extended = false,
}: {
  order: Order;
  extended?: boolean;
}) {
  return (
    <div className="pb-24">
      <PageHeader
        title={`Detalhes do Pedido ${order.number}`}
        href={routes.store.orders}
      />
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Route className="size-4 text-brand" />
              Status
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <ol className="space-y-3">
            {order.timeline.map((step, index) => (
              <li key={step.label} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "mt-1 size-2.5 rounded-full",
                    step.done ? "bg-brand" : "bg-zinc-200",
                    index < order.timeline.length - 1 && "relative",
                  )}
                />
                <span className={step.done ? "text-ink" : "text-zinc-400"}>
                  {step.time ? `${step.time} – ` : ""}
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Bike className="size-4 text-brand" />
            Informações de Entrega
          </h2>
          <Info label="Tipo" value="Via delivery" />
          <Info label="Entregador" value={order.courier ?? "João Pedro da Silva"} />
          <Info label="Veículo" value={order.vehicle ?? "Moto Honda – Placa ABC1D23"} />
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Package className="size-4 text-brand" />
            Itens do Pedido
          </h2>
          <ul className="divide-y divide-zinc-100">
            {order.items.map((item) => (
              <li key={item.name} className="flex gap-3 py-3">
                <div className="size-14 overflow-hidden rounded-lg bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {item.quantity}x {item.name}
                  </p>
                  <p className="text-sm font-semibold text-brand">
                    {formatCurrency(item.price)}
                  </p>
                  {item.extras.length > 0 ? (
                    <div className="mt-1 text-xs">
                      <p className="font-semibold">Adicionais:</p>
                      {item.extras.map((extra) => (
                        <p key={extra} className="text-subtle">
                          1x {extra}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {extended ? (
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <CreditCard className="size-4 text-brand" />
              Informações de Pagamento
            </h2>
            <Info label="Tipo" value={order.paymentDetail} />
            <Info label="Subtotal" value={formatCurrency(order.subtotal)} />
            <Info label="Taxa de entrega" value={formatCurrency(order.deliveryFee)} />
            <div className="mt-2 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </Card>
        ) : null}
      </div>
      <BottomNav active="orders" />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-subtle">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
