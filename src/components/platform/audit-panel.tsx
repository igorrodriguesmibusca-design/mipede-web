"use client";

import { useEffect, useMemo, useState } from "react";

import { PlatformAuditEvent, type PlatformAuditLog } from "@/components/platform/platform-audit-event";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformFilters } from "@/components/platform/platform-filters";
import { PlatformPageHeader } from "@/components/platform/platform-page-header";
import { AUDIT_EVENT_OPTIONS, auditEventLabel } from "@/lib/platform-labels";

const PERIODS = [
  { value: "all", label: "Todo o período" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
];

const RESOURCES = [
  { value: "all", label: "Todos os recursos" },
  { value: "store", label: "Estabelecimento" },
  { value: "platform_admin", label: "Administrador" },
  { value: "platform_invite", label: "Convite de administrador" },
  { value: "user", label: "Conta" },
];

export function PlatformAuditPanel() {
  const [logs, setLogs] = useState<PlatformAuditLog[]>([]);
  const [period, setPeriod] = useState("all");
  const [action, setAction] = useState("all");
  const [resource, setResource] = useState("all");
  const [actor, setActor] = useState("all");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    void fetch("/api/mipede/v1/platform/audit", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { logs: [] }))
      .then((payload: { logs?: PlatformAuditLog[] }) => setLogs(payload.logs ?? []));
  }, []);

  const actionOptions = useMemo(() => {
    const present = new Set(logs.map((item) => item.action));
    const known = AUDIT_EVENT_OPTIONS.filter((item) => present.has(item.value));
    const extras = [...present]
      .filter((value) => !AUDIT_EVENT_OPTIONS.some((item) => item.value === value))
      .map((value) => ({ value, label: auditEventLabel(value) }));
    return [{ value: "all", label: "Todas as ações" }, ...known, ...extras];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((item) => {
      if (period === "7d" && item.created_at < now - 7 * 24 * 60 * 60 * 1000) return false;
      if (period === "30d" && item.created_at < now - 30 * 24 * 60 * 60 * 1000) return false;
      if (action !== "all" && item.action !== action) return false;
      if (resource !== "all" && item.resource_type !== resource) return false;
      if (actor === "team" && !item.actor_user_id) return false;
      return true;
    });
  }, [action, actor, logs, now, period, resource]);

  return (
    <div>
      <PlatformPageHeader
        title="Auditoria"
        description="Acompanhe as ações da equipe interna com nomes compreensíveis e sem dados sensíveis."
      />

      <PlatformFilters
        filters={[
          { id: "period", label: "Período", value: period, onChange: setPeriod, options: PERIODS },
          { id: "action", label: "Tipo de ação", value: action, onChange: setAction, options: actionOptions },
          {
            id: "actor",
            label: "Responsável",
            value: actor,
            onChange: setActor,
            options: [
              { value: "all", label: "Todos os responsáveis" },
              { value: "team", label: "Equipe MiPede" },
            ],
          },
          { id: "resource", label: "Estabelecimento", value: resource, onChange: setResource, options: RESOURCES },
        ]}
        onClear={() => {
          setPeriod("all");
          setAction("all");
          setActor("all");
          setResource("all");
        }}
        resultCount={filtered.length}
      />

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-zinc-100 px-4 py-3 text-xs tracking-wide text-subtle uppercase md:grid">
          <span>Ação</span>
          <span>Responsável</span>
          <span>Recurso afetado</span>
          <span>Data e horário</span>
          <span className="sr-only">Detalhes</span>
        </div>
        {filtered.length === 0 ? (
          <PlatformEmptyState title="Nenhum evento" description="As ações administrativas da plataforma aparecerão aqui." />
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="border-b border-zinc-50 last:border-0">
              <PlatformAuditEvent log={item} />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
