"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Clock3, PauseCircle, Shield, Mail } from "lucide-react";

import { PlatformAttentionList, type AttentionItem } from "@/components/platform/platform-attention-list";
import { PlatformMetricCard } from "@/components/platform/platform-metric-card";
import { PlatformPageHeader } from "@/components/platform/platform-page-header";
import { firstName, inviteIsExpiringSoon, provisioningNeedsAttention } from "@/lib/platform-labels";
import { routes } from "@/lib/routes";

type Dashboard = {
  pending: number;
  active: number;
  suspended: number;
  admins: number;
  invites: number;
};

type StoreRow = {
  id: string;
  name: string;
  status: string;
  provisioning_status: string;
};

type InviteRow = {
  id: string;
  name: string;
  status: string;
  expiresAt: number;
};

type AdminRow = {
  id: string;
  status: string;
};

export function PlatformDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);

  useEffect(() => {
    void fetch("/api/mipede/v1/platform/dashboard", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload) setData(payload as Dashboard);
      });
    void fetch("/api/mipede/v1/platform/stores", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { stores: [] }))
      .then((payload: { stores?: StoreRow[] }) => setStores(payload.stores ?? []));
    void fetch("/api/mipede/v1/platform/admins", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { invites: [], admins: [] }))
      .then((payload: { invites?: InviteRow[]; admins?: AdminRow[] }) => {
        setInvites(payload.invites ?? []);
        setAdmins(payload.admins ?? []);
      });
  }, []);

  const greeting = firstName(userName);
  const pending = data?.pending ?? stores.filter((store) => store.status === "PENDING_REVIEW").length;
  const active = data?.active ?? stores.filter((store) => store.status === "ACTIVE").length;
  const suspended = data?.suspended ?? stores.filter((store) => store.status === "SUSPENDED").length;
  const adminCount = data?.admins ?? admins.filter((admin) => admin.status === "active").length;
  const inviteCount = data?.invites ?? invites.filter((invite) => invite.status === "pending").length;
  const total = stores.length || pending + active + suspended;
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    const pendingStores = stores.filter((store) => store.status === "PENDING_REVIEW");
    for (const store of pendingStores.slice(0, 4)) {
      items.push({
        id: `store-${store.id}`,
        title: store.name,
        description: "Estabelecimento aguardando aprovação.",
        href: routes.platform.store(store.id),
        actionLabel: "Analisar estabelecimento",
      });
    }
    if (pendingStores.length > 4) {
      items.push({
        id: "stores-more",
        title: `${pendingStores.length - 4} estabelecimentos adicionais`,
        description: "Há mais cadastros aguardando a sua análise.",
        href: `${routes.platform.stores}?status=PENDING_REVIEW`,
        actionLabel: "Analisar estabelecimento",
      });
    }
    const expiring = invites.filter((invite) => invite.status === "pending" && inviteIsExpiringSoon(invite.expiresAt));
    if (expiring.length > 0) {
      items.push({
        id: "invites-expiring",
        title: expiring.length === 1 ? "Convite próximo do vencimento" : `${expiring.length} convites próximos do vencimento`,
        description: "Renove ou acompanhe os convites antes que expirem.",
        href: routes.platform.admins,
        actionLabel: "Ver convites",
      });
    }
    const provisioning = stores.filter((store) => provisioningNeedsAttention(store.provisioning_status));
    if (provisioning.length > 0) {
      items.push({
        id: "provisioning",
        title:
          provisioning.length === 1
            ? `${provisioning[0]?.name} com estrutura pendente`
            : `${provisioning.length} estabelecimentos com estrutura pendente`,
        description: "Há lojas cuja estrutura ainda não está pronta.",
        href: routes.platform.stores,
        actionLabel: "Ver provisionamento",
      });
    }
    const suspendedAdmins = admins.filter((admin) => admin.status === "suspended");
    if (suspendedAdmins.length > 0) {
      items.push({
        id: "admins-suspended",
        title:
          suspendedAdmins.length === 1
            ? "Há um administrador suspenso"
            : `${suspendedAdmins.length} administradores suspensos`,
        description: "Revise o acesso da equipe interna quando necessário.",
        href: routes.platform.admins,
        actionLabel: "Ver administradores",
      });
    }
    return items;
  }, [admins, invites, stores]);

  return (
    <div>
      <PlatformPageHeader title="Visão geral" description="Acompanhe os principais indicadores da plataforma MiPede.">
        <p className="mt-3 text-sm text-ink">
          Olá{greeting ? `, ${greeting}` : ""}. Aqui está o resumo da plataforma.
        </p>
      </PlatformPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <PlatformMetricCard
          label="Estabelecimentos ativos"
          value={data ? active : "—"}
          description="Lojas em operação na plataforma."
          icon={Building2}
          href={routes.platform.stores}
          tone="green"
        />
        <PlatformMetricCard
          label="Aguardando aprovação"
          value={data ? pending : "—"}
          description="Estabelecimentos que precisam da sua análise."
          icon={Clock3}
          href={`${routes.platform.stores}?status=PENDING_REVIEW`}
          tone="amber"
        />
        <PlatformMetricCard
          label="Estabelecimentos suspensos"
          value={data ? suspended : "—"}
          description="Lojas temporariamente fora de operação."
          icon={PauseCircle}
          href={`${routes.platform.stores}?status=SUSPENDED`}
          tone="rose"
        />
        <PlatformMetricCard
          label="Administradores ativos"
          value={data ? adminCount : "—"}
          description="Pessoas com acesso ao painel interno."
          icon={Shield}
          href={routes.platform.admins}
          tone="blue"
        />
        <PlatformMetricCard
          label="Convites pendentes"
          value={data ? inviteCount : "—"}
          description="Convites ainda não aceitos."
          icon={Mail}
          href={routes.platform.admins}
          tone="orange"
        />
      </div>

      <div className="mt-8">
        <PlatformAttentionList items={attention} />
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-100 bg-white p-5">
        <h2 className="font-semibold">Resumo da plataforma</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryStat label="Total de estabelecimentos" value={data ? total : "—"} />
          <SummaryStat label="Ativos" value={data ? active : "—"} />
          <SummaryStat label="Em análise" value={data ? pending : "—"} />
          <SummaryStat label="Suspensos" value={data ? suspended : "—"} />
          <SummaryStat label="Percentual de ativos" value={data ? `${activePercent}%` : "—"} />
        </div>
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
