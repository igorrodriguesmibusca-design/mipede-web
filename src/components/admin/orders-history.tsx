"use client";

import { useMemo, useState } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { StatCard } from "@/components/admin/stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { OrderDetailsDrawer } from "@/components/order-manager/order-details-drawer";
import {
  fulfillmentLabel,
  initialManagerOrders,
  statusLabel,
  type ManagerOrder,
} from "@/data/mock-order-manager";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import { Banknote, Ban, Clock3, Receipt, ShoppingBag, Ticket } from "lucide-react";

export function OrdersHistory() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [type, setType] = useState("todos");
  const [payment, setPayment] = useState("todos");
  const [origin, setOrigin] = useState("todos");
  const [selected, setSelected] = useState<ManagerOrder | null>(null);

  const filtered = useMemo(() => {
    return initialManagerOrders.filter((order) => {
      const matchesQuery =
        !query ||
        order.number.toLowerCase().includes(query.toLowerCase()) ||
        order.customer.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "todos" || order.status === status;
      const matchesType = type === "todos" || order.fulfillment === type;
      const matchesPayment = payment === "todos" || order.payment === payment;
      const matchesOrigin = origin === "todos" || order.origin === origin;
      return matchesQuery && matchesStatus && matchesType && matchesPayment && matchesOrigin;
    });
  }, [query, status, type, payment, origin]);

  const total = initialManagerOrders.length;
  const finished = initialManagerOrders.filter((order) => order.status === "FINALIZADO");
  const cancelled = initialManagerOrders.filter((order) => order.status === "CANCELADO");
  const revenue = finished.reduce((sum, order) => sum + order.total, 0);
  const ticket = finished.length === 0 ? 0 : revenue / finished.length;
  const avgPrep =
    finished.reduce((sum, order) => sum + (order.completedOffsetMin ?? order.receivedOffsetMin), 0) /
    Math.max(finished.length, 1);

  return (
    <div>
      <PageHeading
        title="Histórico de Pedidos"
        description="Consulte e analise todos os pedidos recebidos pela sua loja"
        action={
          <a
            href={routes.manager.orders}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
          >
            Abrir Gestor de Pedidos
          </a>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total de pedidos" value={String(total)} icon={ShoppingBag} />
        <StatCard label="Pedidos finalizados" value={String(finished.length)} icon={Receipt} tone="green" />
        <StatCard label="Pedidos cancelados" value={String(cancelled.length)} icon={Ban} tone="rose" />
        <StatCard label="Faturamento" value={formatCurrency(revenue)} icon={Banknote} />
        <StatCard label="Ticket médio" value={formatCurrency(ticket)} icon={Ticket} tone="amber" />
        <StatCard label="Tempo médio de preparo" value={`${Math.round(avgPrep)} min`} icon={Clock3} />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <input type="date" className="h-11 rounded-xl border px-3 text-sm" aria-label="Data inicial" />
        <input type="date" className="h-11 rounded-xl border px-3 text-sm" aria-label="Data final" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border px-3 text-sm">
          <option value="todos">Status</option>
          {Object.entries(statusLabel).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-xl border px-3 text-sm">
          <option value="todos">Atendimento</option>
          <option value="ENTREGA">Entrega própria</option>
          <option value="RETIRADA">Retirada</option>
          <option value="LOCAL">Consumo no local</option>
        </select>
        <select value={payment} onChange={(event) => setPayment(event.target.value)} className="h-11 rounded-xl border px-3 text-sm">
          <option value="todos">Pagamento</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="PIX">PIX</option>
          <option value="Cartão na entrega">Cartão na entrega</option>
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cliente ou número"
          className="h-11 rounded-xl border px-3 text-sm"
        />
      </div>
      <div className="mb-4">
        <select value={origin} onChange={(event) => setOrigin(event.target.value)} className="h-11 rounded-xl border px-3 text-sm">
          <option value="todos">Origem do pedido</option>
          <option value="Instagram">Instagram</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Direto">Direto</option>
          <option value="Meta Ads">Meta Ads</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Pedido", "Data", "Horário", "Cliente", "Tipo", "Pagamento", "Total", "Status", "Preparo", "Origem", "Ações"].map(
                  (head) => (
                    <th key={head} className="px-4 py-3 font-medium">{head}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{order.number}</td>
                  <td className="px-4 py-3">18/08/2026</td>
                  <td className="px-4 py-3">há {order.receivedOffsetMin} min</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{fulfillmentLabel[order.fulfillment]}</td>
                  <td className="px-4 py-3">{order.payment}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={statusLabel[order.status]} />
                  </td>
                  <td className="px-4 py-3">{order.completedOffsetMin ?? order.receivedOffsetMin} min</td>
                  <td className="px-4 py-3">{order.origin}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelected(order)} className="font-semibold text-brand">
                      Ver
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
