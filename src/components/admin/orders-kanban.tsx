"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { Drawer } from "@/components/ui/drawer";
import {
  initialKanbanOrders,
  kanbanColumns,
  type KanbanOrder,
  type KanbanStatus,
} from "@/data/mock-kanban";
import { formatCurrency } from "@/lib/utils";

type BoardTab = "andamento" | "finalizados" | "cancelados";

function nextStatus(order: KanbanOrder): KanbanStatus | null {
  if (order.status === "Novo") return "Aceito";
  if (order.status === "Aceito") return "Em produção";
  if (order.status === "Em produção") return "Pronto";
  if (order.status === "Pronto" && order.delivery === "Entrega própria") return "Em entrega";
  if (order.status === "Pronto") return "Finalizado";
  if (order.status === "Em entrega") return "Finalizado";
  return null;
}

function actionLabel(order: KanbanOrder): string | null {
  if (order.status === "Novo") return "Aceitar pedido";
  if (order.status === "Aceito") return "Iniciar produção";
  if (order.status === "Em produção") return "Marcar como pronto";
  if (order.status === "Pronto" && order.delivery === "Entrega própria") return "Saiu para entrega";
  if (order.status === "Pronto") return "Finalizar pedido";
  if (order.status === "Em entrega") return "Finalizar pedido";
  return null;
}

export function OrdersKanban() {
  const [orders, setOrders] = useState(initialKanbanOrders);
  const [tab, setTab] = useState<BoardTab>("andamento");
  const [query, setQuery] = useState("");
  const [delivery, setDelivery] = useState("todos");
  const [payment, setPayment] = useState("todos");
  const [selected, setSelected] = useState<KanbanOrder | null>(null);
  const updatedAt = "20:41";

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.number.toLowerCase().includes(query.toLowerCase()) ||
        order.customer.toLowerCase().includes(query.toLowerCase());
      const matchesDelivery = delivery === "todos" || order.delivery === delivery;
      const matchesPayment = payment === "todos" || order.payment === payment;
      return matchesQuery && matchesDelivery && matchesPayment;
    });
  }, [orders, query, delivery, payment]);

  const inProgress = filtered.filter((order) =>
    ["Novo", "Aceito", "Em produção", "Pronto", "Em entrega"].includes(order.status),
  );

  function move(id: string, status: KanbanStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
              history: [...order.history, { time: updatedAt, label: status }],
            }
          : order,
      ),
    );
    setSelected((current) =>
      current && current.id === id ? { ...current, status } : current,
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestão de pedidos</h1>
          <p className="mt-1 text-sm text-subtle">
            {inProgress.length} pedidos em andamento · Última atualização {updatedAt}
          </p>
        </div>
        <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm text-emerald-700">
          <RefreshCw className="size-4" />
          Atualização automática simulada
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar pedido</span>
          <Search className="absolute top-3 left-3 size-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por número ou cliente"
            className="h-11 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm"
          />
        </label>
        <select
          value={delivery}
          onChange={(event) => setDelivery(event.target.value)}
          className="h-11 rounded-xl border border-zinc-200 px-3 text-sm"
        >
          <option value="todos">Todos os atendimentos</option>
          <option value="Entrega própria">Entrega própria</option>
          <option value="Retirada no local">Retirada no local</option>
          <option value="Consumo no local">Consumo no local</option>
        </select>
        <select
          value={payment}
          onChange={(event) => setPayment(event.target.value)}
          className="h-11 rounded-xl border border-zinc-200 px-3 text-sm"
        >
          <option value="todos">Todas as formas</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Pix na entrega">Pix na entrega</option>
          <option value="Cartão de débito">Cartão de débito</option>
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        {(
          [
            ["andamento", "Em andamento"],
            ["finalizados", "Finalizados"],
            ["cancelados", "Cancelados"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                : "rounded-xl bg-zinc-100 px-4 py-2 text-sm"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "andamento" ? (
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[1100px] grid-cols-5 gap-3">
            {kanbanColumns.map((column) => {
              const cards = inProgress.filter((order) => order.status === column.id);
              return (
                <section key={column.id} className="rounded-2xl bg-zinc-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{column.label}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${column.tone}`}>
                      {cards.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cards.map((order) => (
                      <article
                        key={order.id}
                        className="rounded-2xl border border-zinc-100 bg-white p-3"
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(order)}
                          className="w-full text-left"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <p className="font-semibold">{order.number}</p>
                            <span className={order.delayed ? "text-xs font-semibold text-red-500" : "text-xs text-subtle"}>
                              {order.minutes} min
                            </span>
                          </div>
                          <p className="text-sm">{order.customer}</p>
                          <p className="text-xs text-subtle">{order.delivery}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-subtle">
                            {order.items.map((item) => `${item.quantity}x ${item.name}`).join(" · ")}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span>{order.payment}</span>
                            <span className="font-semibold">{formatCurrency(order.total)}</span>
                          </div>
                          {order.notes ? (
                            <p className="mt-2 rounded-lg bg-orange-50 px-2 py-1 text-xs text-orange-800">
                              {order.notes}
                            </p>
                          ) : null}
                        </button>
                        <div className="mt-3 flex flex-col gap-2">
                          {actionLabel(order) ? (
                            <button
                              type="button"
                              onClick={() => {
                                const next = nextStatus(order);
                                if (next) move(order.id, next);
                              }}
                              className="h-9 rounded-lg bg-brand text-xs font-semibold text-white"
                            >
                              {actionLabel(order)}
                            </button>
                          ) : null}
                          {order.status === "Novo" ? (
                            <button
                              type="button"
                              onClick={() => move(order.id, "Cancelado")}
                              className="h-9 rounded-lg border border-red-200 text-xs font-semibold text-red-500"
                            >
                              Cancelar
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <OrderTable
          orders={filtered.filter((order) =>
            tab === "finalizados" ? order.status === "Finalizado" : order.status === "Cancelado",
          )}
          cancelled={tab === "cancelados"}
          onOpen={setSelected}
        />
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Pedido ${selected.number}` : "Pedido"}
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">{selected.customer}</p>
              <p className="text-subtle">{selected.phone}</p>
            </div>
            <p>{selected.address ?? "Retirada no estabelecimento"}</p>
            {selected.reference ? <p className="text-subtle">Ref.: {selected.reference}</p> : null}
            <p>Atendimento: {selected.delivery}</p>
            <ul className="space-y-2">
              {selected.items.map((item) => (
                <li key={item.name}>
                  {item.quantity}x {item.name} · {formatCurrency(item.price)}
                  {item.extras.length ? (
                    <span className="block text-xs text-subtle">{item.extras.join(", ")}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            {selected.notes ? <p>Obs.: {selected.notes}</p> : null}
            <div className="space-y-1">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(selected.subtotal)}</span>
              </p>
              <p className="flex justify-between">
                <span>Taxa de entrega</span>
                <span>{formatCurrency(selected.deliveryFee)}</span>
              </p>
              <p className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(selected.total)}</span>
              </p>
            </div>
            <p>Pagamento: {selected.payment}</p>
            <div>
              <p className="mb-2 font-medium">Histórico</p>
              <ul className="space-y-1 text-subtle">
                {selected.history.map((item) => (
                  <li key={`${item.time}-${item.label}`}>
                    {item.time} · {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

function OrderTable({
  orders,
  cancelled,
  onOpen,
}: {
  orders: KanbanOrder[];
  cancelled: boolean;
  onOpen: (order: KanbanOrder) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-subtle">
            <tr>
              {(cancelled
                ? ["Pedido", "Cliente", "Horário", "Valor perdido", "Motivo", "Ação"]
                : ["Pedido", "Cliente", "Horário", "Tipo", "Total", "Tempo total", "Ação"]
              ).map((head) => (
                <th key={head} className="px-4 py-3 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium">{order.number}</td>
                <td className="px-4 py-3">{order.customer}</td>
                <td className="px-4 py-3">{order.time}</td>
                {cancelled ? (
                  <>
                    <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">{order.cancelReason ?? "—"}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{order.delivery}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">{order.duration ?? `${order.minutes} min`}</td>
                  </>
                )}
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onOpen(order)} className="text-sm font-semibold text-brand">
                    Visualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
