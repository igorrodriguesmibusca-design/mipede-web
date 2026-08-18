import Link from "next/link";
import { User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { routes } from "@/lib/routes";

export function CustomerDataSummary({
  name,
  whatsapp,
}: {
  name: string;
  whatsapp: string;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <User className="size-4 text-brand" />
        O pedido será entregue para:
      </h2>
      <div className="mb-3 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-subtle">Nome</span>
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-subtle">WhatsApp</span>
          <span className="font-medium">{whatsapp}</span>
        </div>
      </div>
      <Link
        href={routes.store.identify}
        className="flex h-10 items-center justify-center rounded-lg border border-brand text-sm font-semibold text-brand"
      >
        Trocar
      </Link>
    </Card>
  );
}
