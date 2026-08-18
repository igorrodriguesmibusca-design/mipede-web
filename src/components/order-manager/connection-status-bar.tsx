"use client";

import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { cn } from "@/lib/utils";

export function ConnectionStatusBar() {
  const { connection, lastSync } = useOrderManager();
  const time = lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 text-[11px] text-subtle">
      <span>Gestor de Pedidos MiPede · v0.5</span>
      <span>Gestor de Pedidos atualizado</span>
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "size-1.5 rounded-full",
            connection === "connected" && "bg-success",
            connection === "reconnecting" && "bg-amber-500",
            connection === "offline" && "bg-red-500",
          )}
        />
        {connection === "connected"
          ? "Conectado"
          : connection === "reconnecting"
            ? "Reconectando"
            : "Sem conexão"}
        · sync {time}
      </span>
    </footer>
  );
}
