"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { ConnectionStatusBar } from "@/components/order-manager/connection-status-bar";
import { OrderManagerHeader } from "@/components/order-manager/order-manager-header";
import { OrderManagerProvider } from "@/components/order-manager/order-manager-provider";
import { OrderManagerSidebar } from "@/components/order-manager/order-manager-sidebar";
import { Toast } from "@/components/ui/toast";
import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { cn } from "@/lib/utils";

function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast, setToast } = useOrderManager();

  return (
    <div className="flex h-dvh flex-col bg-zinc-100">
      <OrderManagerHeader />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-16 shrink-0 border-r border-zinc-200 bg-white lg:block">
          <OrderManagerSidebar collapsed />
        </aside>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-56 border-r border-zinc-200 bg-white pt-14 lg:hidden",
            open ? "block" : "hidden",
          )}
        >
          <OrderManagerSidebar collapsed={false} onNavigate={() => setOpen(false)} />
        </aside>
        {open ? (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b border-zinc-200 bg-white px-2 lg:hidden">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
              className="flex size-10 items-center justify-center"
            >
              <Menu className="size-5" />
            </button>
          </div>
          <main className="min-h-0 flex-1 overflow-auto p-4 lg:p-5">{children}</main>
        </div>
      </div>
      <ConnectionStatusBar />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export function OrderManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderManagerProvider>
      <Shell>{children}</Shell>
    </OrderManagerProvider>
  );
}
