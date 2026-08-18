"use client";

import { useState } from "react";
import { Ban, CircleAlert, Receipt, Wallet } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { PerformanceTabs } from "@/components/admin/performance-tabs";
import { PeriodSelector } from "@/components/admin/period-selector";
import { StatCard } from "@/components/admin/stat-card";
import { cancellationsByPeriod, type PeriodKey } from "@/data/mock-analytics";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function CancellationsPage() {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const data = cancellationsByPeriod[period];
  const rate = data.created === 0 ? 0 : (data.cancelled / data.created) * 100;
  const maxDay = Math.max(...data.byDay.map((item) => item.value), 1);

  return (
    <div>
      <PageHeading
        title="Cancelamentos"
        description="Acompanhe perdas, motivos e pedidos cancelados no período"
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PerformanceTabs />
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Taxa de cancelamento" value={formatPercent(rate)} icon={Ban} tone="rose" />
        <StatCard label="Pedidos cancelados" value={String(data.cancelled)} icon={Receipt} />
        <StatCard
          label="Faturamento perdido"
          value={formatCurrency(data.lostRevenue)}
          icon={Wallet}
          tone="amber"
        />
        <StatCard label="Principal motivo" value={data.mainReason} icon={CircleAlert} tone="orange" />
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-zinc-100 p-5">
          <h2 className="mb-4 font-semibold">Cancelamentos por dia</h2>
          <div className="flex h-48 items-end gap-3">
            {data.byDay.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-brand"
                  style={{ height: `${(item.value / maxDay) * 100}%`, minHeight: item.value ? 8 : 0 }}
                />
                <span className="text-[11px] text-subtle">{item.label}</span>
                <span className="text-xs font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-zinc-100 p-5">
          <h2 className="mb-4 font-semibold">Ranking de motivos</h2>
          <ul className="space-y-3">
            {data.reasons.map((item) => (
              <li key={item.reason} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.reason}</p>
                  <p className="text-xs text-subtle">{item.count} pedidos</p>
                </div>
                <span className="font-semibold text-red-500">{formatCurrency(item.lost)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Pedido", "Cliente", "Horário", "Valor", "Motivo", "Responsável", "Origem"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{order.number}</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{order.time}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">{order.reason}</td>
                  <td className="px-4 py-3">{order.responsible}</td>
                  <td className="px-4 py-3">{order.origin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
