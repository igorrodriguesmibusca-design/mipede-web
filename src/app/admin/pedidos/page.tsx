import { Bell, ExternalLink, MapPin } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { orders, orderTabs } from "@/data/mock-orders";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  const selected = orders[0];

  return (
    <div>
      <PageHeading
        title="Pedidos"
        description="Receba e acompanhe os pedidos da sua loja"
        action={
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm">
            <Bell className="size-4" />
            Notificações
          </span>
        }
      />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
        {orderTabs.map((tab, index) => (
          <span
            key={tab.id}
            className={
              index === 0
                ? "shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"
                : "shrink-0 px-3 py-2 text-sm text-zinc-500"
            }
          >
            {tab.label}
            {"count" in tab && tab.count ? ` ${tab.count}` : ""}
          </span>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs text-subtle">
                <tr>
                  {["Pedido", "Cliente", "Horário", "Entrega", "Pagamento", "Total", "Status"].map(
                    (head) => (
                      <th key={head} className="px-4 py-3 font-medium">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium">
                      <span className="mr-2 inline-block size-2 rounded-full bg-brand align-middle" />
                      {order.number}
                    </td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.time}</td>
                    <td className="px-4 py-3">{order.delivery}</td>
                    <td className="px-4 py-3">{order.payment}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <StatusPill value={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination label="Mostrando 1 a 10 de 24 pedidos" />
        </div>

        <aside className="rounded-2xl border border-zinc-100 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-subtle">Pedido</p>
              <p className="text-lg font-semibold">{selected.number}</p>
            </div>
            <StatusPill value={selected.status} />
          </div>
          <p className="mb-3 text-sm">
            <span className="font-medium">{selected.customer}</span>
            <br />
            <span className="text-subtle">{selected.phone}</span>
          </p>
          <div className="mb-3 rounded-xl bg-zinc-50 p-3 text-sm">
            <p className="mb-1 flex items-center gap-1 font-medium">
              <MapPin className="size-3.5 text-brand" />
              Endereço de entrega
            </p>
            <p>{selected.address}</p>
            <p className="text-subtle">
              {selected.neighborhood}, {selected.city}
            </p>
            <p className="text-subtle">CEP {selected.zip}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-brand">
              Ver no mapa <ExternalLink className="size-3" />
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            {selected.items.map((item) => (
              <li key={item.name} className="flex justify-between gap-2">
                <span>
                  {item.quantity}x {item.name}
                  {item.extras[0] ? (
                    <span className="block text-xs text-subtle">{item.extras[0]}</span>
                  ) : null}
                </span>
                <span>{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-subtle">Subtotal</span>
              <span>{formatCurrency(selected.subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-subtle">Taxa de entrega</span>
              <span>{formatCurrency(selected.deliveryFee)}</span>
            </p>
            <p className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-brand">{formatCurrency(selected.total)}</span>
            </p>
          </div>
          <p className="mt-3 text-xs text-subtle">Pagamento: {selected.paymentDetail}</p>
          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
          >
            Aceitar pedido
          </button>
          <button
            type="button"
            className="mt-2 flex h-11 w-full items-center justify-center rounded-xl border border-brand text-sm font-semibold text-brand"
          >
            Cancelar
          </button>
        </aside>
      </div>
    </div>
  );
}
