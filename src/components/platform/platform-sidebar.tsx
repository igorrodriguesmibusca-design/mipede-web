"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ClipboardList, LayoutDashboard, LogOut, Shield } from "lucide-react";

import { PlatformRoleBadge } from "@/components/platform/platform-role-badge";
import { firstName } from "@/lib/platform-labels";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const nav = [
  { href: routes.platform.root, label: "Visão geral", icon: LayoutDashboard },
  { href: routes.platform.stores, label: "Estabelecimentos", icon: Building2 },
  { href: routes.platform.admins, label: "Administradores", icon: Shield },
  { href: routes.platform.audit, label: "Auditoria", icon: ClipboardList },
];

export function PlatformSidebar({
  role,
  userName,
  onNavigate,
}: {
  role: string;
  userName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === routes.platform.root
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                active ? "bg-brand text-white" : "text-zinc-600 hover:bg-zinc-50",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-100 p-3">
        <div className="rounded-2xl bg-zinc-50 p-3">
          <p className="truncate text-sm font-semibold">{firstName(userName) || userName || "Equipe MiPede"}</p>
          <p className="mt-0.5 truncate text-xs text-subtle">{userName || "Conta autenticada"}</p>
          <div className="mt-2">
            <PlatformRoleBadge role={role} />
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={() => {
              onNavigate?.();
              void fetch("/api/mipede/auth/sign-out", { method: "POST", credentials: "include" }).then(() => {
                router.push(routes.auth.login);
                router.refresh();
              });
            }}
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
