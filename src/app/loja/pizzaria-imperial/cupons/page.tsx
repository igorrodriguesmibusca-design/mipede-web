import { Tag } from "lucide-react";

import { BottomNav } from "@/components/storefront/bottom-nav";
import { PageHeader } from "@/components/storefront/page-header";
import { Card } from "@/components/ui/card";
import { coupons } from "@/data/mock-orders";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export default function CouponsPage() {
  return (
    <div className="pb-24">
      <PageHeader title="Cupons" href={routes.store.home} />
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Tag className="size-4 text-brand" />
              {coupon.title}
            </h2>
            <Info label="Tipo" value={coupon.type} />
            <Info label="Válido até" value={coupon.validUntil} />
            <Info label="Valor mínimo" value={formatCurrency(coupon.minValue)} />
            {coupon.exclusive ? (
              <p className="mt-2 text-sm font-medium text-success">{coupon.exclusive}</p>
            ) : null}
            <span className="mt-4 flex h-11 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white">
              EU QUERO
            </span>
          </Card>
        ))}
      </div>
      <BottomNav active="coupons" />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 text-sm">
      <span className="text-subtle">{label}</span>
      <span>{value}</span>
    </div>
  );
}
