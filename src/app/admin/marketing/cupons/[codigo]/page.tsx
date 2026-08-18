import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { StatCard } from "@/components/admin/stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { couponDaily, couponOrders, couponPerformance } from "@/data/mock-analytics";
import { routes } from "@/lib/routes";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Banknote, Receipt, Ticket, Wallet } from "lucide-react";

const slugs = ["fretegratis", "bemvindo10", "menos20"] as const;

export function generateStaticParams() {
  return slugs.map((codigo) => ({ codigo }));
}

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const coupon = couponPerformance.find((item) => item.slug === codigo);

  if (!coupon) {
    notFound();
  }

  const ticket = coupon.orders === 0 ? 0 : coupon.revenue / coupon.orders;
  const cost = coupon.orders === 0 ? 0 : coupon.investment / coupon.orders;
  const roi =
    coupon.investment === 0 ? null : ((coupon.revenue - coupon.investment) / coupon.investment) * 100;
  const progress = coupon.limit === 0 ? 0 : (coupon.used / coupon.limit) * 100;
  const orders = couponOrders[coupon.slug as keyof typeof couponOrders] ?? [];
  const maxRevenue = Math.max(...couponDaily.map((item) => item.revenue), 1);

  return (
    <div>
      <Link href={routes.admin.coupons} className="mb-3 inline-flex items-center gap-1 text-sm text-subtle">
        <ChevronLeft className="size-4" />
        Voltar para cupons
      </Link>
      <PageHeading
        title={coupon.code}
        description={`${coupon.benefit} · válido até ${coupon.validUntil}`}
        action={
          <span className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm">
            Editar
          </span>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StatusPill value={coupon.status} />
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 text-sm">
          {["Hoje", "Últimos 7 dias", "30 dias", "Período total"].map((item) => (
            <span
              key={item}
              className={
                item === "Período total"
                  ? "rounded-lg bg-brand px-3 py-1.5 font-semibold text-white"
                  : "px-3 py-1.5 text-zinc-500"
              }
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Investimento" value={formatCurrency(coupon.investment)} icon={Wallet} />
        <StatCard label="Faturamento gerado" value={formatCurrency(coupon.revenue)} icon={Banknote} tone="rose" />
        <StatCard label="Pedidos" value={String(coupon.orders)} icon={Receipt} />
        <StatCard label="Ticket médio dos pedidos" value={formatCurrency(ticket)} icon={Ticket} tone="green" />
        <StatCard
          label="ROI promocional estimado"
          value={roi === null ? "—" : formatPercent(roi)}
          icon={Banknote}
        />
        <StatCard label="Custo médio do benefício" value={formatCurrency(cost)} icon={Wallet} tone="amber" />
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-100 p-5">
          <h2 className="mb-4 font-semibold">Investimento x faturamento</h2>
          <div className="flex h-48 items-end gap-3">
            {couponDaily.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-36 w-full items-end justify-center gap-1">
                  <div
                    className="w-2 rounded-t bg-zinc-300"
                    style={{ height: `${(item.investment / maxRevenue) * 100}%` }}
                  />
                  <div
                    className="w-2 rounded-t bg-brand"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-subtle">{item.label.slice(0, 5)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-zinc-100 p-5">
          <h2 className="mb-4 font-semibold">Utilizações e regras</h2>
          <p className="mb-2 text-sm">Progresso do limite de uso</p>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
          </div>
          <p className="mb-4 text-sm text-subtle">{coupon.uses}</p>
          <p className="text-sm"><span className="text-subtle">Regra:</span> {coupon.rule}</p>
          <p className="text-sm"><span className="text-subtle">Público:</span> {coupon.audience}</p>
          <p className="text-sm"><span className="text-subtle">Validade:</span> {coupon.validUntil}</p>
          <p className="mt-3 text-sm">
            Evolução das utilizações: {couponDaily.reduce((sum, item) => sum + item.uses, 0)} usos no recorte semanal.
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Pedido", "Cliente", "Data", "Subtotal", "Desconto", "Total após desconto", "Status"].map(
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
                <tr key={order.number} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{order.number}</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{order.date}</td>
                  <td className="px-4 py-3">{formatCurrency(order.subtotal)}</td>
                  <td className="px-4 py-3">{formatCurrency(order.discount)}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
