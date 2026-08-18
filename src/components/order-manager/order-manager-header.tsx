"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Fullscreen,
  Headphones,
  Settings,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { Switch } from "@/components/ui/switch";
import { routes } from "@/lib/routes";
import { useTenant } from "@/lib/tenant-context";
import { cn } from "@/lib/utils";

export function OrderManagerHeader() {
  const { storeOpen, toggleStore, soundOn, toggleSound, connection } = useOrderManager();
  const tenant = useTenant();
  const storeName = tenant.mode === "live" ? (tenant.store?.name ?? "Sua loja") : "Pizzaria Imperial";
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    function tick() {
      setClock(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      );
    }
    tick();
    const timer = window.setInterval(tick, 15000);
    return () => window.clearInterval(timer);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-3">
        <MipedeLogo />
        <span className="hidden h-6 w-px bg-zinc-200 sm:block" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold">{storeName}</p>
          <p className={cn("text-xs font-medium", storeOpen ? "text-success" : "text-red-500")}>
            {storeOpen ? "Loja aberta" : "Loja fechada"}
          </p>
        </div>
        <button
          type="button"
          className="hidden items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs md:inline-flex"
          title="Trocar estabelecimento"
        >
          Trocar
          <ChevronDown className="size-3" />
        </button>
        <div className="flex items-center gap-2">
          <Switch checked={storeOpen} aria-label="Abrir ou fechar loja" onClick={toggleStore} />
          <span className="hidden text-xs text-subtle lg:inline">{storeOpen ? "Aberta" : "Fechada"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="px-2 font-mono text-sm font-semibold">{clock}</span>
        <span
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-1 text-xs font-medium sm:inline-flex",
            connection === "connected" && "bg-emerald-50 text-success",
            connection === "reconnecting" && "bg-amber-50 text-amber-700",
            connection === "offline" && "bg-red-50 text-red-600",
          )}
        >
          <Wifi className="size-3.5" />
          {connection === "connected" ? "Conectado" : connection === "reconnecting" ? "Reconectando" : "Sem conexão"}
        </span>
        <IconButton
          label={soundOn ? "Desativar som" : "Ativar som"}
          onClick={toggleSound}
        >
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </IconButton>
        <IconButton label="Notificações">
          <Bell className="size-4" />
        </IconButton>
        <IconButton label="Suporte">
          <Headphones className="size-4" />
        </IconButton>
        <IconButton label="Tela cheia" onClick={toggleFullscreen}>
          <Fullscreen className="size-4" />
        </IconButton>
        <a href={routes.manager.settings} title="Configurações" aria-label="Configurações" className="flex size-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50">
          <Settings className="size-4" />
        </a>
      </div>
    </header>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}
