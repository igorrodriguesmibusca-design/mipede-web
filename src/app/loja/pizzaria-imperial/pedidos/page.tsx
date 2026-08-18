"use client";

import { ClipboardList } from "lucide-react";

import { BottomNav } from "@/components/storefront/bottom-nav";
import { EmptyState } from "@/components/storefront/empty-state";
import { OrderCard } from "@/components/storefront/order-card";
import { PageHeader } from "@/components/storefront/page-header";
import { customerOrders } from "@/data/mock-orders";
import { useDemoSessionToken } from "@/lib/demo-customer-session";
import { routes } from "@/lib/routes";

export default function OrdersPage() {
  const recognized = Boolean(useDemoSessionToken());

  return (
    <div className="pb-24">
      <PageHeader title="Meus Pedidos" href={routes.store.home} />
      {recognized ? (
        <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">
          {customerOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              fullHref={
                index === 1
                  ? routes.store.orderFull(order.id)
                  : routes.store.order(order.id)
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          message="Identifique-se neste dispositivo após um pedido para ver seu histórico."
        />
      )}
      <BottomNav active="orders" />
    </div>
  );
}
