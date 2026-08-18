import { ClipboardList } from "lucide-react";

import { BottomNav } from "@/components/storefront/bottom-nav";
import { EmptyState } from "@/components/storefront/empty-state";
import { PageHeader } from "@/components/storefront/page-header";
import { routes } from "@/lib/routes";

export default function EmptyOrdersPage() {
  return (
    <div className="pb-24">
      <PageHeader title="Meus Pedidos" href={routes.store.home} />
      <EmptyState
        icon={ClipboardList}
        message="Nada por aqui ainda… que tal começar um pedido?"
      />
      <BottomNav active="orders" />
    </div>
  );
}
