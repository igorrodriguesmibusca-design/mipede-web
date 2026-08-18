"use client";

import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { fulfillmentLabel, type ManagerOrder } from "@/data/mock-order-manager";
import { formatCurrency } from "@/lib/utils";

type Tab = "aguardando" | "rota" | "entregues";

export default function DispatchPage() {
  const { orders, drivers, assignDriver, markOut, advance } = useOrderManager();
  const [tab, setTab] = useState<Tab>("aguardando");
  const [picking, setPicking] = useState<ManagerOrder | null>(null);

  const waiting = orders.filter((order) => order.status === "PRONTO" && order.fulfillment === "ENTREGA");
  const route = orders.filter((order) => order.status === "EM_ROTA");
  const delivered = orders.filter((order) => order.status === "FINALIZADO" && order.fulfillment === "ENTREGA");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Expedição</h1>
      <p className="mb-4 text-sm text-subtle">Entrega própria do estabelecimento. Sem GPS em tempo real nesta etapa.</p>

      <div className="mb-4 flex gap-2">
        {(
          [
            ["aguardando", "Aguardando saída", waiting.length],
            ["rota", "Em rota", route.length],
            ["entregues", "Entregues", delivered.length],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                : "rounded-xl bg-white px-4 py-2 text-sm"
            }
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {tab === "aguardando" ? (
        <List
          empty="Nenhum pedido pronto para saída."
          rows={waiting.map((order) => (
            <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.number} · {order.customer}</p>
                  <p className="text-sm text-subtle">
                    {order.address?.neighborhood} · {order.address?.street}, {order.address?.number}
                  </p>
                  <p className="text-sm">
                    Pronto há {order.history[order.history.length - 1]?.atOffsetMin ?? 0} min · {order.payment}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(order.total)}</p>
              </div>
              {order.driverId ? (
                <button
                  type="button"
                  onClick={() => markOut(order.id)}
                  className="mt-3 h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
                >
                  Saiu para entrega
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPicking(order)}
                  className="mt-3 h-10 rounded-xl border border-brand px-4 text-sm font-semibold text-brand"
                >
                  Selecionar entregador
                </button>
              )}
            </article>
          ))}
        />
      ) : null}

      {tab === "rota" ? (
        <List
          empty="Nenhuma entrega em rota."
          rows={route.map((order) => {
            const driver = drivers.find((item) => item.id === order.driverId);
            return (
              <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="font-semibold">{order.number} · {order.customer}</p>
                <p className="text-sm">Entregador: {driver?.name ?? "—"}</p>
                <p className="text-sm text-subtle">
                  Saiu há {order.departedOffsetMin ?? 0} min · {order.address?.neighborhood} · {order.payment}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">{formatCurrency(order.total)}</span>
                  <button
                    type="button"
                    onClick={() => advance(order.id)}
                    className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
                  >
                    Marcar como entregue
                  </button>
                </div>
              </article>
            );
          })}
        />
      ) : null}

      {tab === "entregues" ? (
        <List
          empty="Nenhuma entrega recente."
          rows={delivered.map((order) => (
            <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="font-semibold">{order.number} · {order.customer}</p>
              <p className="text-sm text-subtle">
                {order.address?.street}, {order.address?.number} · {fulfillmentLabel[order.fulfillment]}
              </p>
              <p className="mt-1 font-semibold">{formatCurrency(order.total)}</p>
              <span className="mt-2 inline-flex text-sm font-semibold text-brand">Abrir no mapa</span>
            </article>
          ))}
        />
      ) : null}

      <Dialog open={Boolean(picking)} onClose={() => setPicking(null)} title="Selecionar entregador">
        <ul className="space-y-2">
          {drivers.map((driver) => (
            <li key={driver.id}>
              <button
                type="button"
                onClick={() => {
                  if (picking) assignDriver(picking.id, driver.id);
                  setPicking(null);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-200 px-3 py-3 text-left"
              >
                <span>
                  <span className="block font-medium">{driver.name}</span>
                  <span className="text-xs text-subtle">
                    {driver.status === "disponivel" ? "Disponível" : "Em rota"} · {driver.deliveries} entregas · {driver.phone}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}

function List({ empty, rows }: { empty: string; rows: React.ReactNode[] }) {
  if (rows.length === 0) {
    return <p className="rounded-2xl border border-zinc-200 bg-white py-10 text-center text-sm text-subtle">{empty}</p>;
  }
  return <div className="space-y-3">{rows}</div>;
}
