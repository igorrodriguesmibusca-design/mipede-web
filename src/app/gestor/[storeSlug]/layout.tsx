import { notFound } from "next/navigation";

import { TenantPanelGate } from "@/components/admin/tenant-panel-gate";
import { OrderManagerLayout } from "@/components/order-manager/order-manager-layout";
import { TenantProvider } from "@/lib/tenant-context";
import { getTenantView } from "@/server/session";

export function generateStaticParams() {
  return [{ storeSlug: "pizzaria-imperial" }];
}

export const dynamicParams = true;

export default async function GestorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const tenant = await getTenantView();

  if (tenant.mode === "live") {
    if (!tenant.store || tenant.store.slug !== storeSlug) {
      notFound();
    }
  } else if (storeSlug !== "pizzaria-imperial") {
    notFound();
  }

  return (
    <TenantProvider value={tenant}>
      <OrderManagerLayout>
        <TenantPanelGate area="gestor">{children}</TenantPanelGate>
      </OrderManagerLayout>
    </TenantProvider>
  );
}
