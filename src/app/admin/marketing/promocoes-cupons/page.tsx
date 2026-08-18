import { Calendar, Search } from "lucide-react";

import { CouponMetrics } from "@/components/admin/coupon-metrics";
import { CouponPerformanceTable } from "@/components/admin/coupon-performance-table";
import { PageHeading } from "@/components/admin/page-heading";

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

      <CouponMetrics />

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

      <CouponPerformanceTable />
    </div>
  );
}
