"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Fullscreen, Search, Settings, Volume2 } from "lucide-react";
import Link from "next/link";

import { CancellationDialog } from "@/components/order-manager/cancellation-dialog";
import { OperationalOrderCard } from "@/components/order-manager/operational-order-card";
import { OrderDetailsDrawer } from "@/components/order-manager/order-details-drawer";
import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { canCancel, type ManagerOrder } from "@/data/mock-order-manager";
import { routes } from "@/lib/routes";

export default function ManagerOrdersPage() {
  const router = useRouter();
  const { orders, simulateOrder, advance, cancel, toggleSound, tickMinutes } = useOrderManager();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ManagerOrder | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [readyOpen, setReadyOpen] = useState(true);
  const [routeOpen, setRouteOpen] = useState(true);
  const [doneOpen, setDoneOpen] = useState(true);

  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          !query ||
          order.number.toLowerCase().includes(query.toLowerCase()) ||
          order.customer.toLowerCase().includes(query.toLowerCase()),
      ),
    [orders, query],
  );

  const novos = filtered.filter((order) => order.status === "NOVO");
  const preparo = filtered
    .filter((order) => order.status === "ACEITO" || order.status === "EM_PREPARO")
    .slice()
    .sort((a, b) => b.receivedOffsetMin - a.receivedOffsetMin);
  const prontos = filtered.filter((order) => order.status === "PRONTO");
  const rota = filtered.filter((order) => order.status === "EM_ROTA");
  const finalizados = filtered.filter((order) => order.status === "FINALIZADO").slice(0, 4);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar pedido</span>
          <Search className="absolute top-3 left-3 size-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por número ou cliente"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-3 pl-9 text-sm"
          />
        </label>
        <button type="button" className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm">
          Filtros
        </button>
        <button
          type="button"
          onClick={simulateOrder}
          className="h-11 rounded-xl border border-dashed border-brand bg-orange-50 px-4 text-sm font-semibold text-brand"
        >
          Simular novo pedido
        </button>
        <button type="button" onClick={toggleSound} className="h-11 rounded-xl border bg-white px-3" aria-label="Som" title="Som">
          <Volume2 className="size-4" />
        </button>
        <Link href={routes.manager.settings} className="flex h-11 items-center rounded-xl border bg-white px-3" aria-label="Configurações" title="Configurações">
          <Settings className="size-4" />
        </Link>
        <button
          type="button"
          aria-label="Tela cheia"
          title="Tela cheia"
          onClick={() => {
            if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
            else void document.exitFullscreen();
          }}
          className="flex h-11 items-center rounded-xl border bg-white px-3"
        >
          <Fullscreen className="size-4" />
        </button>
      </div>

      <section className="rounded-2xl border border-brand/20 bg-orange-50/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Novos pedidos</h2>
          <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">{novos.length}</span>
        </div>
        {novos.length === 0 ? (
          <p className="py-6 text-center text-sm text-subtle">Nenhum pedido aguardando aceite.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {novos.map((order) => (
              <OperationalOrderCard
                key={order.id}
                order={order}
                minutes={tickMinutes(order)}
                onOpen={() => setSelected(order)}
                onAdvance={() => advance(order.id)}
                onCancel={() => setCancelId(order.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[55%_45%]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Em preparo</h2>
            <span className="text-sm text-subtle">{preparo.length}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {preparo.map((order) => (
              <OperationalOrderCard
                key={order.id}
                order={order}
                minutes={tickMinutes(order)}
                onOpen={() => setSelected(order)}
                onAdvance={() => advance(order.id)}
                onCancel={canCancel(order.status) ? () => setCancelId(order.id) : undefined}
              />
            ))}
          </div>
        </section>

        <div className="space-y-3">
          <Collapsible title="Prontos" count={prontos.length} open={readyOpen} onToggle={() => setReadyOpen((v) => !v)}>
            {prontos.map((order) => (
              <OperationalOrderCard
                key={order.id}
                order={order}
                minutes={tickMinutes(order)}
                onOpen={() => setSelected(order)}
                onAdvance={() => {
                  if (order.fulfillment === "ENTREGA") {
                    router.push(routes.manager.dispatch);
                    return;
                  }
                  advance(order.id);
                }}
              />
            ))}
          </Collapsible>
          <Collapsible title="Em rota" count={rota.length} open={routeOpen} onToggle={() => setRouteOpen((v) => !v)}>
            {rota.map((order) => (
              <OperationalOrderCard
                key={order.id}
                order={order}
                minutes={tickMinutes(order)}
                onOpen={() => setSelected(order)}
                onAdvance={() => advance(order.id)}
              />
            ))}
          </Collapsible>
          <Collapsible title="Finalizados recentemente" count={finalizados.length} open={doneOpen} onToggle={() => setDoneOpen((v) => !v)}>
            {finalizados.map((order) => (
              <OperationalOrderCard
                key={order.id}
                order={order}
                minutes={tickMinutes(order)}
                onOpen={() => setSelected(order)}
              />
            ))}
          </Collapsible>
        </div>
      </div>

      <OrderDetailsDrawer order={selected} onClose={() => setSelected(null)} />
      <CancellationDialog
        open={Boolean(cancelId)}
        onClose={() => setCancelId(null)}
        onConfirm={(reason) => {
          if (cancelId) cancel(cancelId, reason);
          setCancelId(null);
        }}
      />
    </div>
  );
}

function Collapsible({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-3 py-2">
        <span className="font-semibold">{title}</span>
        <span className="flex items-center gap-2 text-sm text-subtle">
          {count}
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-zinc-100 p-3">
          {count === 0 ? <p className="py-4 text-center text-sm text-subtle">Nenhum pedido nesta etapa.</p> : children}
        </div>
      ) : null}
    </section>
  );
}
