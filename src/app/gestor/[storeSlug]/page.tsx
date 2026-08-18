"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ChevronDown, PauseCircle, ShoppingBag, Truck } from "lucide-react";

import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { daySummary } from "@/data/mock-order-manager";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export default function ManagerHomePage() {
  const { storeOpen, pausedCount, orders, lastSync } = useOrderManager();
  const [openSummary, setOpenSummary] = useState(true);
  const inProgress = orders.filter((order) =>
    ["NOVO", "ACEITO", "EM_PREPARO", "PRONTO", "EM_ROTA"].includes(order.status),
  ).length;
  const waitingAccept = orders.filter((order) => order.status === "NOVO").length;
  const nearLimit = orders.filter((order) => {
    const minutes = order.receivedOffsetMin;
    return minutes > 15 && minutes <= 25 && ["ACEITO", "EM_PREPARO"].includes(order.status);
  }).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Olá, Pizzaria Imperial</h1>
        <p className="text-sm text-subtle">Acompanhe a operação da sua loja em tempo real</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Status da loja" value={storeOpen ? "Aberta" : "Fechada"} hint="18h às 23h" />
        <Stat label="Tempo médio de preparo" value="20 min" hint="configurado" />
        <Stat label="Pedidos em andamento" value={String(inProgress)} />
        <Stat label="Itens pausados" value={String(pausedCount)} />
        <Stat
          label="Última atualização"
          value={lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Resumo do dia</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Stat label="Pedidos recebidos" value={String(daySummary.received)} />
          <Stat label="Pedidos concluídos" value={String(daySummary.completed)} />
          <Stat label="Pedidos cancelados" value={String(daySummary.cancelled)} />
          <Stat label="Faturamento do dia" value={formatCurrency(daySummary.revenue)} />
          <Stat label="Ticket médio" value={formatCurrency(daySummary.ticket)} />
          <Stat label="Tempo médio de preparo" value={`${daySummary.avgPrep} min`} />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Alertas operacionais</h2>
        <ul className="space-y-2 text-sm">
          <Alert text={`${nearLimit} pedidos próximos do limite de preparo`} tone="warn" />
          <Alert text={`${pausedCount} produto(s) com estoque indisponível`} tone="warn" />
          <Alert text={`${waitingAccept} pedido(s) aguardando aceite`} tone={waitingAccept ? "alert" : "ok"} />
          <Alert text={storeOpen ? "Loja aberta normalmente" : "Loja fechada"} tone={storeOpen ? "ok" : "alert"} />
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white">
        <button
          type="button"
          onClick={() => setOpenSummary((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <h2 className="font-semibold">Resumo das últimas oito horas</h2>
          <ChevronDown className={`size-4 transition-transform ${openSummary ? "rotate-180" : ""}`} />
        </button>
        {openSummary ? (
          <div className="grid gap-3 border-t border-zinc-100 px-4 py-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Pedidos concluídos" value={String(daySummary.last8hCompleted)} />
            <Stat label="Total vendido" value={formatCurrency(daySummary.last8hSold)} />
            <Stat label="Taxas de entrega" value={formatCurrency(daySummary.last8hFees)} />
            <Stat label="Total faturado" value={formatCurrency(daySummary.last8hTotal)} />
            <Stat label="Ticket médio" value={formatCurrency(daySummary.last8hTicket)} />
            <Stat
              label="Por atendimento"
              value={`${daySummary.byType.entrega} ent. · ${daySummary.byType.retirada} ret. · ${daySummary.byType.local} local`}
            />
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Shortcut href={routes.manager.orders} icon={ShoppingBag} label="Ver novos pedidos" />
        <Shortcut href={routes.manager.catalog} icon={PauseCircle} label="Pausar item" />
        <Shortcut href={routes.manager.dispatch} icon={Truck} label="Abrir expedição" />
        <Shortcut href={routes.manager.history} icon={AlertTriangle} label="Consultar histórico" />
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </article>
  );
}

function Alert({ text, tone }: { text: string; tone: "ok" | "warn" | "alert" }) {
  return (
    <li
      className={
        tone === "ok"
          ? "rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800"
          : tone === "warn"
            ? "rounded-lg bg-amber-50 px-3 py-2 text-amber-800"
            : "rounded-lg bg-red-50 px-3 py-2 text-red-700"
      }
    >
      {text}
    </li>
  );
}

function Shortcut({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof ShoppingBag;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-semibold text-white"
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
