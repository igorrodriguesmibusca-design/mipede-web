import Link from "next/link";
import { Copy, MoreVertical, Pencil } from "lucide-react";

import { Pagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { couponPerformance } from "@/data/mock-analytics";
import { routes } from "@/lib/routes";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function CouponPerformanceTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-subtle">
            <tr>
              {[
                "Cupom",
                "Benefício",
                "Status",
                "Pedidos",
                "Investimento",
                "Faturamento gerado",
                "ROI estimado",
                "Validade",
                "Ações",
              ].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {couponPerformance.map((coupon) => (
              <tr key={coupon.slug} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <Link href={routes.admin.coupon(coupon.slug)} className="font-semibold text-brand">
                    {coupon.code}
                  </Link>
                </td>
                <td className="px-4 py-3">{coupon.benefit}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <StatusPill value={coupon.status} />
                    <Switch checked={coupon.status === "Ativo"} aria-label={coupon.code} />
                  </span>
                </td>
                <td className="px-4 py-3">{coupon.orders}</td>
                <td className="px-4 py-3">{formatCurrency(coupon.investment)}</td>
                <td className="px-4 py-3">{formatCurrency(coupon.revenue)}</td>
                <td className="px-4 py-3">{formatPercent(coupon.roi)}</td>
                <td className="px-4 py-3">{coupon.validUntil}</td>
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
  );
}
