"use client";

import { LiveBannersPage } from "@/components/admin/live-banners-page";
import { PageHeading } from "@/components/admin/page-heading";
import { useTenant } from "@/lib/tenant-context";

export default function BannersPage() {
  const tenant = useTenant();
  if (tenant.mode === "live") return <LiveBannersPage />;
  return (
    <div>
      <PageHeading
        title="Banners do Cardápio"
        description="Crie destaques promocionais e escolha onde eles aparecem no seu cardápio"
      />
      <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
        <p className="font-medium">Nenhum banner criado</p>
        <p className="mt-1 text-sm text-subtle">No modo demonstração os banners reais ficam na loja autenticada.</p>
      </div>
    </div>
  );
}
