"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { PlatformActionMenu } from "@/components/platform/platform-action-menu";
import { PlatformConfirmationDialog } from "@/components/platform/platform-confirmation-dialog";
import { PlatformDataTable } from "@/components/platform/platform-data-table";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformFilters } from "@/components/platform/platform-filters";
import { PlatformPageHeader } from "@/components/platform/platform-page-header";
import { PlatformStatusBadge } from "@/components/platform/platform-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  displayValue,
  formatPlatformDate,
  locationLabel,
  storeActionLabel,
  storeActionsForStatus,
  storeDecisionCopy,
  storeStatusLabel,
  type StoreDecisionAction,
} from "@/lib/platform-labels";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  onboarding_status: string;
  provisioning_status: string;
  city: string | null;
  state?: string | null;
  created_at: number;
  owner_name?: string;
  owner_email?: string;
};

const SUMMARY_FILTERS = [
  { id: "all", label: "Todos", status: "" },
  { id: "pending", label: "Aguardando aprovação", status: "PENDING_REVIEW" },
  { id: "active", label: "Ativos", status: "ACTIVE" },
  { id: "suspended", label: "Suspensos", status: "SUSPENDED" },
  { id: "rejected", label: "Rejeitados", status: "REJECTED" },
] as const;

export function PlatformStoresPanel() {
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [city, setCity] = useState("");
  const [pendingAction, setPendingAction] = useState<{ store: StoreRow; action: StoreDecisionAction } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/mipede/v1/platform/stores", { credentials: "include" });
    if (!response.ok) {
      setError("Não foi possível carregar os estabelecimentos.");
      return;
    }
    const payload = (await response.json()) as { stores: StoreRow[] };
    setStores(payload.stores ?? []);
  }

  useEffect(() => {
    void fetch("/api/mipede/v1/platform/stores", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { stores?: StoreRow[] } | null) => {
        if (!payload) {
          setError("Não foi possível carregar os estabelecimentos.");
          return;
        }
        setStores(payload.stores ?? []);
      });
  }, []);

  const counts = useMemo(
    () => ({
      all: stores.length,
      PENDING_REVIEW: stores.filter((store) => store.status === "PENDING_REVIEW").length,
      ACTIVE: stores.filter((store) => store.status === "ACTIVE").length,
      SUSPENDED: stores.filter((store) => store.status === "SUSPENDED").length,
      REJECTED: stores.filter((store) => store.status === "REJECTED").length,
    }),
    [stores],
  );

  const cities = useMemo(
    () =>
      Array.from(new Set(stores.map((store) => store.city).filter((value): value is string => Boolean(value)))).sort(
        (left, right) => left.localeCompare(right, "pt-BR"),
      ),
    [stores],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stores.filter((store) => {
      if (status && store.status !== status) return false;
      if (city && store.city !== city) return false;
      if (!needle) return true;
      return [store.name, store.owner_name, store.city].some((value) => value?.toLowerCase().includes(needle));
    });
  }, [city, query, status, stores]);

  async function decide(store: StoreRow, action: StoreDecisionAction, reason?: string) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/mipede/v1/platform/stores/${store.id}`, {
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

  const confirmation = pendingAction ? storeDecisionCopy(pendingAction.action) : null;

  return (
    <div>
      <PlatformPageHeader
        title="Estabelecimentos"
        description="Gerencie cadastros, aprovações e o acesso das lojas à plataforma."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {SUMMARY_FILTERS.map((item) => {
          const count = item.status ? counts[item.status] : counts.all;
          const activeFilter = status === item.status;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.status)}
              className={cn(
                "rounded-2xl border bg-white px-4 py-3 text-left",
                activeFilter ? "border-brand bg-brand-soft" : "border-zinc-100",
              )}
            >
              <p className="text-xs text-subtle">{item.label}</p>
              <p className="mt-1 text-xl font-semibold">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <PlatformFilters
          search={query}
          searchPlaceholder="Buscar por loja, proprietário ou cidade"
          onSearchChange={setQuery}
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              onChange: setStatus,
              options: [
                { value: "", label: "Todos os status" },
                { value: "PENDING_REVIEW", label: storeStatusLabel("PENDING_REVIEW") },
                { value: "ACTIVE", label: storeStatusLabel("ACTIVE") },
                { value: "SUSPENDED", label: storeStatusLabel("SUSPENDED") },
                { value: "REJECTED", label: storeStatusLabel("REJECTED") },
                { value: "INACTIVE", label: storeStatusLabel("INACTIVE") },
              ],
            },
            ...(cities.length > 0
              ? [
                  {
                    id: "city",
                    label: "Cidade",
                    value: city,
                    onChange: setCity,
                    options: [
                      { value: "", label: "Todas as cidades" },
                      ...cities.map((item) => ({ value: item, label: item })),
                    ],
                  },
                ]
              : []),
          ]}
          onClear={() => {
            setQuery("");
            setStatus("");
            setCity("");
          }}
          resultCount={filtered.length}
        />
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 rounded-2xl border border-zinc-100 bg-white">
        <PlatformDataTable
          rows={filtered}
          rowKey={(store) => store.id}
          empty={
            <PlatformEmptyState
              title="Nenhum estabelecimento encontrado"
              description="Ajuste a busca ou os filtros para ver outros cadastros."
            />
          }
          mobileTitle={(store) => store.name}
          columns={[
            {
              id: "store",
              header: "Estabelecimento",
              cell: (store) => <span className="font-medium">{store.name}</span>,
              mobile: false,
            },
            {
              id: "owner",
              header: "Proprietário",
              cell: (store) => displayValue(store.owner_name),
            },
            {
              id: "location",
              header: "Localização",
              cell: (store) => locationLabel(store.city, store.state),
            },
            {
              id: "created",
              header: "Cadastro",
              cell: (store) => formatPlatformDate(store.created_at),
            },
            {
              id: "onboarding",
              header: "Onboarding",
              cell: (store) => <PlatformStatusBadge kind="onboarding" value={store.onboarding_status} />,
            },
            {
              id: "status",
              header: "Status",
              cell: (store) => <PlatformStatusBadge kind="store" value={store.status} />,
            },
            {
              id: "structure",
              header: "Estrutura da loja",
              cell: (store) => <PlatformStatusBadge kind="provisioning" value={store.provisioning_status} />,
            },
            {
              id: "actions",
              header: "Ações",
              cell: (store) => {
                const actions = storeActionsForStatus(store.status);
                const menu = actions.filter((action) => action !== "view");
                return (
                  <div className="flex items-center justify-end gap-2">
                    <Link href={routes.platform.store(store.id)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Ver detalhes
                    </Link>
                    <PlatformActionMenu
                      items={menu.map((action) => ({
                        id: action,
                        label: storeActionLabel(action),
                        destructive: action === "reject" || action === "suspend",
                        onSelect: () => setPendingAction({ store, action }),
                      }))}
                    />
                  </div>
                );
              },
            },
          ]}
        />
      </div>

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
          return decide(pendingAction.store, pendingAction.action, reason);
        }}
      />
    </div>
  );
}
