"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FolderTree,
  Link2,
  Megaphone,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof BarChart3;
};

type NavGroup = {
  label?: string;
  icon?: typeof BarChart3;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    items: [{ href: routes.admin.performance, label: "Desempenho", icon: BarChart3 }],
  },
  {
    label: "Cardápio",
    icon: UtensilsCrossed,
    items: [
      { href: routes.admin.categories, label: "Categorias", icon: FolderTree },
      { href: routes.admin.products, label: "Produtos", icon: ShoppingBag },
      { href: routes.admin.addons, label: "Complementos", icon: Boxes },
    ],
  },
  {
    items: [{ href: routes.admin.orders, label: "Pedidos", icon: ShoppingBag }],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    items: [
      { href: routes.admin.coupons, label: "Promoções e Cupons", icon: Tags },
      { href: routes.admin.tracking, label: "Links de Rastreamento", icon: Link2 },
    ],
  },
  {
    items: [{ href: routes.admin.customers, label: "Clientes", icon: Users }],
  },
  {
    label: "Configurações",
    icon: Settings,
    items: [
      { href: routes.admin.store, label: "Configuração da Loja", icon: Store },
      { href: routes.admin.delivery, label: "Entrega e Pagamento", icon: Truck },
    ],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-3 p-3">
      {groups.map((group) => (
        <div
          key={group.label ?? group.items[0].href}
          className="rounded-2xl bg-zinc-50 p-2"
        >
          {group.label ? (
            <p className="mb-1 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink">
              {group.icon ? <group.icon className="size-4" /> : null}
              {group.label}
            </p>
          ) : null}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-brand text-white"
                        : "text-zinc-600 hover:bg-white",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
