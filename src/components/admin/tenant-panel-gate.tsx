"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/lib/routes";
import { useTenant } from "@/lib/tenant-context";

export function TenantPanelGate({
  area,
  children,
}: {
  area: "admin" | "gestor";
  children: React.ReactNode;
}) {
  const tenant = useTenant();
  const router = useRouter();
  const operatorOnAdmin =
    tenant.mode === "live" &&
    tenant.platformRole !== "platform_admin" &&
    tenant.platformRole !== "platform_owner" &&
    tenant.store?.role === "operator" &&
    area === "admin";

  useEffect(() => {
    if (operatorOnAdmin && tenant.mode === "live" && tenant.store) {
      router.replace(routes.managerFor(tenant.store.slug).root);
    }
  }, [operatorOnAdmin, router, tenant]);

  if (tenant.mode === "anonymous") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Sessão necessária</h2>
        <p className="mt-2 text-sm text-subtle">Entre com a conta do estabelecimento para ver este painel.</p>
      </div>
    );
  }

  if (operatorOnAdmin) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-subtle">
        Operadores usam o Gestor de Pedidos.
      </div>
    );
  }

  if (tenant.mode === "live") {
    const pending = !tenant.store || tenant.store.status === "DRAFT" || tenant.store.status === "PENDING_REVIEW";
    return (
      <div className="space-y-4">
        {pending ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Estabelecimento aguardando aprovação. O cardápio público permanece desligado, mas você já pode preparar o
            cardápio e as configurações.
          </div>
        ) : null}
        {tenant.store?.status === "SUSPENDED" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Esta loja está suspensa.
          </div>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
        Modo demonstração — os dados da Pizzaria Imperial são fictícios e não pertencem a um restaurante autenticado.
      </div>
      {children}
    </div>
  );
}
