import { Calendar, Copy, MoreVertical, Pencil, Search, ShoppingBag, Ticket, TrendingUp } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatCard } from "@/components/admin/stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { coupons } from "@/data/mock-orders";
import { couponStats } from "@/data/mock-tracking";
import { formatCurrency } from "@/lib/utils";

export default function CouponsAdminPage() {
  return (
    <div>
      <PageHeading
        title="Promoções e Cupons"
        description="Crie incentivos para aumentar a conversão da sua loja"
        action={
          <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Novo cupom
          </span>
        }
      />

      <div className="mb-5 flex gap-6 text-sm">
        {["Promoções", "Cupons", "Banners"].map((tab) => (
          <span
            key={tab}
            className={tab === "Cupons" ? "border-b-2 border-brand pb-2 font-semibold text-brand" : "text-zinc-500"}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StatCard label="Cupons ativos" value={String(couponStats.active)} icon={Ticket} />
        <StatCard label="Utilizações" value={String(couponStats.uses)} icon={TrendingUp} tone="green" />
        <StatCard
          label="Vendas geradas"
          value={formatCurrency(couponStats.revenue)}
          icon={ShoppingBag}
          tone="rose"
        />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <label className="relative md:col-span-1">
          <span className="sr-only">Buscar cupom</span>
          <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
          <input
            readOnly
            placeholder="Buscar cupom"
            className="h-11 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm"
          />
        </label>
        <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm">
          <option>Status: Todos</option>
        </select>
        <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm">
          <option>Tipo de benefício: Todos</option>
        </select>
        <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm text-subtle">
          <Calendar className="size-4" />
          Todos os períodos
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Cupom", "Benefício", "Regra", "Utilizações", "Validade", "Status", "Ações"].map(
                  (head) => (
                    <th key={head} className="px-4 py-3 font-medium">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-semibold">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.type}</td>
                  <td className="px-4 py-3">{coupon.rule}</td>
                  <td className="px-4 py-3">{coupon.uses}</td>
                  <td className="px-4 py-3">{coupon.validUntil}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <StatusPill value={coupon.status} />
                      <Switch checked={coupon.status === "Ativo"} aria-label={coupon.code} />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-2 text-zinc-400">
                      <Pencil className="size-4" />
                      <Copy className="size-4" />
                      <MoreVertical className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="Exibindo 1 a 3 de 3 cupons" pages={[1]} />
      </div>
    </div>
  );
}
