"use client";

import { Banknote, ShoppingBag, Ticket, Users } from "lucide-react";

import { useTenant } from "@/lib/tenant-context";

import { LineChart } from "@/components/admin/line-chart";
import { PageHeading } from "@/components/admin/page-heading";
import { PerformanceTabs } from "@/components/admin/performance-tabs";
import { StatCard } from "@/components/admin/stat-card";
import { performanceMetrics } from "@/data/mock-tracking";
import { formatCurrency } from "@/lib/utils";

const ranges = ["Hoje", "Últimos 7 dias", "30 dias"];

export default function PerformancePage() {
  const tenant = useTenant();
  const live = tenant.mode === "live";
  const finished = live ? "0" : String(performanceMetrics.finishedOrders);
  const revenue = live ? formatCurrency(0) : formatCurrency(performanceMetrics.revenue);
  const ticket = live ? formatCurrency(0) : formatCurrency(performanceMetrics.averageTicket);
  return (
    <div>
      <PageHeading
        title="Desempenho"
        description={live ? "Os indicadores aparecerão após os primeiros acessos e pedidos." : "Acompanhe os principais indicadores da sua loja"}
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PerformanceTabs />
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
          value={finished}
          delta={live ? undefined : "14,29%"}
          up={false}
          icon={ShoppingBag}
          tone="orange"
        />
        <StatCard
          label="Faturamento"
          value={revenue}
          delta={live ? undefined : "5,4%"}
          up={false}
          icon={Banknote}
          tone="rose"
        />
        <StatCard
          label="Ticket médio"
          value={ticket}
          delta={live ? undefined : "10,37%"}
          up
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Novos clientes"
          value={live ? "0" : String(performanceMetrics.newCustomers)}
          delta={live ? undefined : "33,33%"}
          up={false}
          icon={Users}
          tone="rose"
        />
      </div>

      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-5 md:px-8">
        <div className="mb-4 flex gap-4 overflow-x-auto text-sm">
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
