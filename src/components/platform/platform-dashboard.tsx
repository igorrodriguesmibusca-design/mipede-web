"use client";

import { useState } from "react";
import Link from "next/link";

import { routes } from "@/lib/routes";

type Dashboard = {
  pending: number;
  active: number;
  suspended: number;
  admins: number;
  invites: number;
  recent: Array<{ id: string; action: string; created_at: number }>;
};

export function PlatformDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [started, setStarted] = useState(false);
  if (!started) {
    setStarted(true);
    void fetch("/api/mipede/v1/platform/dashboard", { credentials: "include" })
      .then((response) => response.json())
      .then((payload) => setData(payload as Dashboard));
  }

  const cards = [
    { label: "Aguardando aprovação", value: data?.pending ?? "—", href: routes.platform.stores },
    { label: "Estabelecimentos ativos", value: data?.active ?? "—", href: routes.platform.stores },
    { label: "Suspensos", value: data?.suspended ?? "—", href: routes.platform.stores },
    { label: "Administradores ativos", value: data?.admins ?? "—", href: routes.platform.admins },
    { label: "Convites pendentes", value: data?.invites ?? "—", href: routes.platform.admins },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Visão geral</h1>
      <p className="mt-1 text-sm text-subtle">Operação interna da plataforma MiPede.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-subtle">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Últimas ações</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(data?.recent ?? []).length === 0 ? <li className="text-subtle">Nenhuma ação ainda.</li> : null}
          {(data?.recent ?? []).map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>{item.action}</span>
              <span className="text-subtle">{new Date(item.created_at).toLocaleString("pt-BR")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
