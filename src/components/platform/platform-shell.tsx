"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, LayoutDashboard, Shield } from "lucide-react";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const nav = [
  { href: routes.platform.root, label: "Visão geral", icon: LayoutDashboard },
  { href: routes.platform.stores, label: "Estabelecimentos", icon: Building2 },
  { href: routes.platform.admins, label: "Administradores", icon: Shield },
  { href: routes.platform.audit, label: "Auditoria", icon: ClipboardList },
];

export function PlatformShell({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <MipedeLogo />
            <span className="hidden text-sm text-subtle sm:block">Painel interno</span>
          </div>
          <p className="text-xs font-medium text-brand">{role === "platform_owner" ? "Proprietário da plataforma" : "Administrador"}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== routes.platform.root && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                  active ? "bg-brand text-white" : "text-zinc-600 hover:bg-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
