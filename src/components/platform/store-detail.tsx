"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PlatformActionMenu } from "@/components/platform/platform-action-menu";
import { PlatformAuditEvent, type PlatformAuditLog } from "@/components/platform/platform-audit-event";
import { PlatformConfirmationDialog } from "@/components/platform/platform-confirmation-dialog";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformPageHeader } from "@/components/platform/platform-page-header";
import { PlatformStatusBadge } from "@/components/platform/platform-status-badge";
import { Button } from "@/components/ui/button";
import {
  displayValue,
  formatPlatformDate,
  formatPlatformDateTime,
  locationLabel,
  storeActionLabel,
  storeDecisionActions,
  storeDecisionCopy,
  storePrimaryDecision,
  type StoreDecisionAction,
} from "@/lib/platform-labels";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type StoreRecord = Record<string, string | number | null | undefined>;

export function PlatformStoreDetail({ storeId }: { storeId: string }) {
  const [payload, setPayload] = useState<{ store?: StoreRecord; history?: PlatformAuditLog[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<StoreDecisionAction | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch(`/api/mipede/v1/platform/stores/${storeId}`, { credentials: "include" });
    if (!response.ok) {
      setError("Não foi possível carregar o estabelecimento.");
      return;
    }
    setPayload(await response.json());
  }

  useEffect(() => {
    void fetch(`/api/mipede/v1/platform/stores/${storeId}`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((next: { store?: StoreRecord; history?: PlatformAuditLog[] } | null) => {
        if (!next) {
          setError("Não foi possível carregar o estabelecimento.");
          return;
        }
        setPayload(next);
      });
  }, [storeId]);

  async function decide(action: StoreDecisionAction, reason?: string) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/mipede/v1/platform/stores/${storeId}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("A ação não pôde ser concluída.");
      return;
    }
    setPendingAction(null);
    await load();
  }

  const store = payload?.store;
  const status = String(store?.status ?? "");
  const decisions = storeDecisionActions(status);
  const primary = storePrimaryDecision(status);
  const secondary = decisions.filter((action) => action !== primary);
  const confirmation = pendingAction ? storeDecisionCopy(pendingAction) : null;

  return (
    <div>
      <Link href={routes.platform.stores} className="mb-4 inline-flex items-center gap-1 text-sm text-subtle hover:text-ink">
        <ArrowLeft className="size-4" />
        Voltar para estabelecimentos
      </Link>
      <PlatformPageHeader
        title={displayValue(store?.name, "Estabelecimento")}
        description={locationLabel(
          typeof store?.city === "string" ? store.city : null,
          typeof store?.state === "string" ? store.state : null,
        )}
        action={
          store ? (
            <div className="flex items-center gap-2">
              {primary ? (
                <Button type="button" onClick={() => setPendingAction(primary)}>
                  {storeActionLabel(primary)}
                </Button>
              ) : null}
              <PlatformActionMenu
                items={secondary.map((action) => ({
                  id: action,
                  label: storeActionLabel(action),
                  destructive: action === "reject" || action === "suspend",
                  onSelect: () => setPendingAction(action),
                }))}
              />
            </div>
          ) : null
        }
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PlatformStatusBadge kind="store" value={status} />
          <span className="text-sm text-subtle">Cadastrado em {formatPlatformDate(store?.created_at)}</span>
        </div>
      </PlatformPageHeader>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailSection title="Dados gerais">
          <DetailRow label="Nome fantasia" value={displayValue(store?.name)} />
          <DetailRow label="Razão social" value="Não informado" />
          <DetailRow label="Documento da empresa" value="Não informado" />
          <DetailRow label="Endereço público" value={displayValue(store?.slug)} />
          <DetailRow label="Identificador interno" value={displayValue(store?.id)} muted />
        </DetailSection>
        <DetailSection title="Responsável">
          <DetailRow label="Nome do responsável" value="Não informado" />
          <DetailRow label="E-mail" value="Não informado" />
          <DetailRow label="Telefone" value="Não informado" />
        </DetailSection>
        <DetailSection title="Operação">
          <DetailRow label="Tipo de operação" value="Não informado" />
          <DetailRow label="Modalidades de atendimento" value="Não informado" />
          <DetailRow
            label="Cidade e estado"
            value={locationLabel(
              typeof store?.city === "string" ? store.city : null,
              typeof store?.state === "string" ? store.state : null,
            )}
          />
        </DetailSection>
        <DetailSection title="Onboarding">
          <div className="flex items-center justify-between gap-3">
            <span className="text-subtle">Etapa do onboarding</span>
            <PlatformStatusBadge kind="onboarding" value={typeof store?.onboarding_status === "string" ? store.onboarding_status : null} />
          </div>
          <DetailRow label="Data de cadastro" value={formatPlatformDate(store?.created_at)} />
        </DetailSection>
        <DetailSection title="Situação da plataforma" className="xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-subtle">Status</span>
              <PlatformStatusBadge kind="store" value={status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-subtle">Situação do provisionamento</span>
              <PlatformStatusBadge
                kind="provisioning"
                value={typeof store?.provisioning_status === "string" ? store.provisioning_status : null}
              />
            </div>
          </div>
          <DetailRow label="Aprovado em" value={formatPlatformDateTime(store?.approved_at)} />
          <DetailRow label="Motivo da recusa" value={displayValue(store?.rejection_reason)} />
        </DetailSection>
      </div>

      <section className="mt-4 rounded-2xl border border-zinc-100 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="font-semibold">Histórico</h2>
        </div>
        {(payload?.history ?? []).length === 0 ? (
          <div className="p-5">
            <PlatformEmptyState title="Sem histórico ainda" description="As decisões sobre este estabelecimento aparecerão aqui." />
          </div>
        ) : (
          (payload?.history ?? []).map((item) => <PlatformAuditEvent key={item.id} log={item} />)
        )}
      </section>

      <PlatformConfirmationDialog
        open={Boolean(pendingAction)}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmLabel={confirmation?.confirmLabel ?? "Confirmar"}
        destructive={confirmation?.destructive}
        requiresReason={confirmation?.requiresReason}
        pending={busy}
        onClose={() => setPendingAction(null)}
        onConfirm={(reason) => {
          if (!pendingAction) return;
          return decide(pendingAction, reason);
        }}
      />
    </div>
  );
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-zinc-100 bg-white p-5", className)}>
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3 text-sm">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-subtle">{label}</span>
      <span className={cn("text-right", muted && "text-xs text-zinc-400")}>{value}</span>
    </div>
  );
}
