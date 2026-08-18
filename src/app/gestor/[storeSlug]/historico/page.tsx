"use client";

import { useMemo, useState } from "react";

import { OrderDetailsDrawer } from "@/components/order-manager/order-details-drawer";
import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import {
  fulfillmentLabel,
  statusLabel,
  type ManagerOrder,
  type ManagerStatus,
} from "@/data/mock-order-manager";
import { formatCurrency } from "@/lib/utils";

export default function ManagerHistoryPage() {
  const { orders } = useOrderManager();
  const [range, setRange] = useState<"hoje" | "ontem" | "7d">("hoje");
  const [status, setStatus] = useState("todos");
  const [type, setType] = useState("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ManagerOrder | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const recent =
        range === "hoje"
          ? order.receivedOffsetMin <= 24 * 60
          : range === "ontem"
            ? order.receivedOffsetMin > 60 && order.receivedOffsetMin <= 48 * 60
            : true;
      const matchesStatus = status === "todos" || order.status === status;
      const matchesType = type === "todos" || order.fulfillment === type;
      const matchesQuery = !query || order.number.includes(query);
      return recent && matchesStatus && matchesType && matchesQuery;
    });
  }, [orders, range, status, type, query]);

  const completed = filtered.filter((order) => order.status === "FINALIZADO");
  const cancelled = filtered.filter((order) => order.status === "CANCELADO");
  const revenue = completed.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Histórico operacional</h1>
      <p className="mb-4 text-sm text-subtle">Pedidos recentes necessários para a operação.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["hoje", "ontem", "7d"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={
              range === item
                ? "rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white"
                : "rounded-xl bg-white px-3 py-2 text-sm"
            }
          >
            {item === "hoje" ? "Hoje" : item === "ontem" ? "Ontem" : "Últimos 7 dias"}
          </button>
        ))}
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm">
          <option value="todos">Todos os status</option>
          {Object.entries(statusLabel).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm">
          <option value="todos">Todos os tipos</option>
          <option value="ENTREGA">Entrega</option>
          <option value="RETIRADA">Retirada</option>
          <option value="LOCAL">Consumo no local</option>
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Número do pedido"
          className="h-10 rounded-xl border px-3 text-sm"
        />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Mini label="Pedidos do período" value={String(filtered.length)} />
        <Mini label="Finalizados" value={String(completed.length)} />
        <Mini label="Cancelados" value={String(cancelled.length)} />
        <Mini label="Faturamento" value={formatCurrency(revenue)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Pedido", "Horário", "Cliente", "Tipo", "Total", "Status", "Tempo total", "Ação"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{order.number}</td>
                  <td className="px-4 py-3">há {order.receivedOffsetMin} min</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{fulfillmentLabel[order.fulfillment]}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">{statusLabel[order.status as ManagerStatus]}</td>
                  <td className="px-4 py-3">{order.completedOffsetMin ?? order.receivedOffsetMin} min</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelected(order)} className="font-semibold text-brand">
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <OrderDetailsDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-3">
      <p className="text-xs text-subtle">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </article>
  );
}
