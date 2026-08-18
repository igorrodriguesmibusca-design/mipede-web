"use client";

import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-white">
      <AdminTopbar onMenu={() => setOpen((value) => !value)} />
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-zinc-100 bg-white pt-16 lg:static lg:z-0 lg:block lg:h-[calc(100dvh-4rem)] lg:pt-0",
            open ? "block" : "hidden lg:block",
          )}
        >
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </aside>
        {open ? (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <main className="min-w-0 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
