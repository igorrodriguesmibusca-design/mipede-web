"use client";

import { useState } from "react";

import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformTopbar } from "@/components/platform/platform-topbar";
import { cn } from "@/lib/utils";

export function PlatformShell({
  role,
  userName,
  children,
}: {
  role: string;
  userName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-zinc-50">
      <PlatformTopbar userName={userName} role={role} onMenu={() => setOpen((value) => !value)} />
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-zinc-100 bg-white pt-16 lg:static lg:z-0 lg:h-full lg:pt-0",
            open ? "flex" : "hidden lg:flex",
          )}
        >
          <PlatformSidebar role={role} userName={userName} onNavigate={() => setOpen(false)} />
        </aside>
        {open ? (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
