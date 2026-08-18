"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  Home,
  Settings,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const items = [
  { href: routes.manager.root, label: "Início", icon: Home, exact: true },
  { href: routes.manager.orders, label: "Pedidos", icon: ShoppingBag },
  { href: routes.manager.dispatch, label: "Expedição", icon: Truck },
  { href: routes.manager.catalog, label: "Cardápio", icon: UtensilsCrossed },
  { href: routes.manager.history, label: "Histórico", icon: Clock3 },
  { href: routes.manager.settings, label: "Configurações", icon: Settings },
];

export function OrderManagerSidebar({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
              active ? "bg-brand text-white" : "text-zinc-600 hover:bg-zinc-100",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
