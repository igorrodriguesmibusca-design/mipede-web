import { Banknote, CircleHelp, Percent, ShoppingBag, Wallet } from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { couponOverview } from "@/data/mock-analytics";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function CouponMetrics() {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Investimento promocional"
        value={formatCurrency(couponOverview.investment)}
        icon={Wallet}
      />
      <StatCard
        label="Faturamento gerado"
        value={formatCurrency(couponOverview.revenue)}
        icon={Banknote}
        tone="rose"
      />
      <StatCard
        label="Pedidos com cupom"
        value={String(couponOverview.orders)}
        icon={ShoppingBag}
        tone="green"
      />
      <article className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
        <div>
          <p className="flex items-center gap-1 text-sm text-subtle">
            ROI promocional estimado
            <span
              title="Estimativa baseada no faturamento atribuído e no valor investido nos benefícios. Não considera o custo de produção dos itens."
              className="inline-flex"
            >
              <CircleHelp className="size-3.5" />
            </span>
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {couponOverview.investment === 0 ? "—" : formatPercent(couponOverview.roi)}
          </p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full bg-orange-50 text-brand">
          <Percent className="size-5" />
        </span>
      </article>
    </div>
  );
}
