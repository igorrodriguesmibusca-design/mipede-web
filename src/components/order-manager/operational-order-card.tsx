"use client";

import { actionLabel, delayLevel, fulfillmentLabel, itemCount, type ManagerOrder } from "@/data/mock-order-manager";
import { managerDrivers } from "@/data/mock-order-manager";
import { cn, formatCurrency } from "@/lib/utils";

export function OperationalOrderCard({
  order,
  minutes,
  onOpen,
  onAdvance,
  onCancel,
}: {
  order: ManagerOrder;
  minutes: number;
  onOpen: () => void;
  onAdvance?: () => void;
  onCancel?: () => void;
}) {
  const level = delayLevel(minutes);
  const next = actionLabel(order);
  const driver = managerDrivers.find((item) => item.id === order.driverId);

  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-3",
        order.status === "NOVO" && "border-brand ring-1 ring-brand/20",
        order.status !== "NOVO" && "border-zinc-200",
      )}
    >
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="font-semibold">{order.number}</p>
          <span
            className={cn(
              "text-xs font-semibold",
              level === "ok" && "text-subtle",
              level === "warn" && "text-amber-600",
              level === "late" && "text-red-600",
            )}
          >
            {minutes} min
            {level === "late" ? " · atrasado" : level === "warn" ? " · atenção" : ""}
          </span>
        </div>
        <p className="text-sm">{order.customer}</p>
        <p className="text-xs text-subtle">{fulfillmentLabel[order.fulfillment]}</p>
        <p className="mt-2 line-clamp-2 text-xs text-subtle">
          {order.items.map((item) => `${item.qty}x ${item.name}`).join(" · ")}
        </p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>{itemCount(order)} it. · {order.payment}</span>
          <span className="font-semibold">{formatCurrency(order.total)}</span>
        </div>
        {order.notes ? (
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">{order.notes}</p>
        ) : null}
        {order.status === "EM_ROTA" && driver ? (
          <p className="mt-2 text-xs text-subtle">Entregador: {driver.name}</p>
        ) : null}
        {order.status === "FINALIZADO" ? (
          <p className="mt-2 text-xs font-medium text-success">Concluído · {order.completedOffsetMin ?? minutes} min</p>
        ) : null}
      </button>
      <div className="mt-3 flex flex-col gap-2">
        {next && onAdvance ? (
          <button
            type="button"
            onClick={onAdvance}
            className="h-10 rounded-lg bg-brand text-sm font-semibold text-white"
          >
            {next}
          </button>
        ) : null}
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-red-200 text-sm font-semibold text-red-600"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </article>
  );
}
