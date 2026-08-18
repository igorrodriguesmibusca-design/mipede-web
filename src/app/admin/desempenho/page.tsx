import { Banknote, ShoppingBag, Ticket, Users } from "lucide-react";

import { LineChart } from "@/components/admin/line-chart";
import { PageHeading } from "@/components/admin/page-heading";
import { StatCard } from "@/components/admin/stat-card";
import { performanceMetrics } from "@/data/mock-tracking";
import { formatCurrency } from "@/lib/utils";

const tabs = ["Vendas", "Itens", "Funil de Vendas", "Marketing", "Clientes", "Cancelamentos"];
const ranges = ["Hoje", "Últimos 7 dias", "30 dias"];

export default function PerformancePage() {
  return (
    <div>
      <PageHeading
        title="Desempenho"
        description="Acompanhe os principais indicadores da sua loja"
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
          {tabs.map((tab, index) => (
            <span
              key={tab}
              className={
                index === 0
                  ? "shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand"
                  : "shrink-0 px-3 py-1.5 text-sm text-zinc-500"
              }
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
          {ranges.map((range) => (
            <span
              key={range}
              className={
                range === "Últimos 7 dias"
                  ? "rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                  : "px-3 py-1.5 text-sm text-zinc-500"
              }
            >
              {range}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos finalizados"
          value={String(performanceMetrics.finishedOrders)}
          delta="14,29%"
          up={false}
          icon={ShoppingBag}
          tone="orange"
        />
        <StatCard
          label="Faturamento"
          value={formatCurrency(performanceMetrics.revenue)}
          delta="5,4%"
          up={false}
          icon={Banknote}
          tone="rose"
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(performanceMetrics.averageTicket)}
          delta="10,37%"
          up
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Novos clientes"
          value={String(performanceMetrics.newCustomers)}
          delta="33,33%"
          up={false}
          icon={Users}
          tone="rose"
        />
      </div>

      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
        <div className="mb-3 flex gap-4 overflow-x-auto text-sm">
          {["Pedidos", "Faturamento", "Ticket médio", "Novos clientes"].map((item, index) => (
            <span
              key={item}
              className={index === 0 ? "font-semibold text-brand" : "text-zinc-500"}
            >
              {item}
            </span>
          ))}
        </div>
        <LineChart />
      </section>
    </div>
  );
}
