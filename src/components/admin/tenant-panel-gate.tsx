"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/lib/routes";
import { useTenant } from "@/lib/tenant-context";

const LIVE_COPY: Record<string, { title: string; description: string }> = {
  "/admin/desempenho": {
    title: "Ainda não há desempenho para mostrar",
    description: "Quando a loja for aprovada e começar a vender, os indicadores aparecem aqui.",
  },
  "/admin/cardapio": {
    title: "Cardápio vazio",
    description: "Nenhum produto, categoria ou complemento foi publicado ainda.",
  },
  "/admin/pedidos": {
    title: "Sem pedidos",
    description: "Pedidos reais só existem depois da aprovação e da operação ativa.",
  },
  "/admin/marketing": {
    title: "Sem campanhas",
    description: "Crie cupons e links depois que o estabelecimento estiver aprovado.",
  },
  "/admin/clientes": {
    title: "Sem clientes",
    description: "Os clientes desta loja aparecerão quando houver pedidos reais.",
  },
  "/admin/configuracoes": {
    title: "Configurações da sua loja",
    description: "Os dados da Pizzaria Imperial não são usados neste painel.",
  },
  "/gestor": {
    title: "Gestor operacional vazio",
    description: "Não há pedidos ao vivo enquanto a loja não estiver em operação.",
  },
};

function copyFor(pathname: string) {
  const match = Object.entries(LIVE_COPY).find(([prefix]) => pathname.startsWith(prefix));
  return match?.[1] ?? LIVE_COPY["/admin/desempenho"];
}

export function TenantPanelGate({
  area,
  children,
}: {
  area: "admin" | "gestor";
  children: React.ReactNode;
}) {
  const tenant = useTenant();
  const pathname = usePathname();
  const router = useRouter();
  const operatorOnAdmin =
    tenant.mode === "live" &&
    tenant.platformRole !== "platform_admin" &&
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
    const copy = copyFor(pathname);
    const pending = !tenant.store || tenant.store.status === "DRAFT" || tenant.store.status === "PENDING_REVIEW";
    return (
      <div className="space-y-4">
        {pending ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Estabelecimento aguardando aprovação. O cardápio público permanece desligado.
          </div>
        ) : null}
        {tenant.store?.status === "SUSPENDED" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Esta loja está suspensa.
          </div>
        ) : null}
        <section className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center">
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">Loja autenticada</p>
          <h2 className="mt-2 text-xl font-semibold">{tenant.store?.name ?? "Sua loja"}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-subtle">{copy.description}</p>
          <p className="mt-4 text-sm font-medium">{copy.title}</p>
        </section>
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
