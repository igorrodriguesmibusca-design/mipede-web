import { BarChart3, Copy, CreditCard, Eye, MoreVertical, ShoppingBag, Users } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatCard } from "@/components/admin/stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { trackingFunnel, trackingLinks, trackingStats } from "@/data/mock-tracking";
import { formatCurrency } from "@/lib/utils";

const originClass: Record<string, string> = {
  "Instagram orgânico": "bg-violet-50 text-violet-600",
  "Meta Ads": "bg-sky-50 text-sky-600",
  "Google Ads": "bg-amber-50 text-amber-700",
  WhatsApp: "bg-emerald-50 text-emerald-600",
};

export default function TrackingPage() {
  return (
    <div>
      <PageHeading
        title="Links de Rastreamento"
        description="Acompanhe quais divulgações geram pedidos e faturamento"
        action={
          <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Novo link
          </span>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Acessos"
          value={trackingStats.visits.toLocaleString("pt-BR")}
          delta={trackingStats.visitsDelta}
          up={trackingStats.visitsUp}
          icon={Eye}
          tone="rose"
        />
        <StatCard
          label="Pedidos finalizados"
          value={String(trackingStats.orders)}
          delta={trackingStats.ordersDelta}
          up={trackingStats.ordersUp}
          icon={ShoppingBag}
          tone="green"
        />
        <StatCard
          label="Conversão"
          value={trackingStats.conversion}
          delta={trackingStats.conversionDelta}
          up={trackingStats.conversionUp}
          icon={BarChart3}
          tone="blue"
        />
        <StatCard
          label="Faturamento atribuído"
          value={formatCurrency(trackingStats.revenue)}
          delta={trackingStats.revenueDelta}
          up={trackingStats.revenueUp}
          icon={CreditCard}
          tone="rose"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["Hoje", "7 dias", "30 dias"].map((item) => (
          <span
            key={item}
            className={
              item === "7 dias"
                ? "rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                : "rounded-lg bg-zinc-100 px-3 py-1.5 text-sm"
            }
          >
            {item}
          </span>
        ))}
        <select className="h-9 rounded-lg border border-zinc-200 px-3 text-sm">
          <option>Origem: Todos</option>
        </select>
        <select className="h-9 rounded-lg border border-zinc-200 px-3 text-sm">
          <option>Campanha: Todos</option>
        </select>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Nome do link", "Origem", "Campanha", "Acessos", "Pedidos", "Conversão", "Faturamento", "Status", "Ações"].map(
                  (head) => (
                    <th key={head} className="px-4 py-3 font-medium">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {trackingLinks.map((link) => (
                <tr key={link.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{link.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${originClass[link.origin]}`}>
                      {link.origin}
                    </span>
                  </td>
                  <td className="px-4 py-3">{link.campaign}</td>
                  <td className="px-4 py-3">{link.visits}</td>
                  <td className="px-4 py-3">{link.orders}</td>
                  <td className="px-4 py-3">{link.conversion}</td>
                  <td className="px-4 py-3">{formatCurrency(link.revenue)}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={link.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-2 text-zinc-400">
                      <Copy className="size-4" />
                      <MoreVertical className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="Mostrando 1 a 4 de 4 links" pages={[1]} />
      </div>

      <section className="rounded-2xl border border-zinc-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Funil do link selecionado</h2>
            <p className="text-sm text-subtle">{trackingFunnel.name}</p>
          </div>
          <p className="text-xs text-subtle">{trackingFunnel.period}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {trackingFunnel.steps.map((step, index) => (
            <article key={step.label} className="rounded-xl border border-zinc-100 p-3">
              <p className="text-xs text-subtle">
                {index + 1}. {step.label}
              </p>
              <p className="mt-1 text-xl font-semibold">{step.value}</p>
              {"drop" in step && step.drop ? (
                <p className="text-[11px] text-subtle">{step.drop}</p>
              ) : null}
            </article>
          ))}
          <article className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs text-brand">Conversão total</p>
            <p className="mt-1 text-xl font-semibold text-brand">{trackingFunnel.conversion}</p>
          </article>
        </div>
        <p className="sr-only">
          <Users className="size-4" />
        </p>
      </section>
    </div>
  );
}
