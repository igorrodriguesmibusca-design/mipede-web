"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
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

type NavSection = {
  id: string;
  label: string;
  icon: typeof BarChart3;
  href?: string;
  items?: NavItem[];
};

const sections: NavSection[] = [
  {
    id: "desempenho",
    label: "Desempenho",
    icon: BarChart3,
    href: routes.admin.performance,
  },
  {
    id: "cardapio",
    label: "Cardápio",
    icon: UtensilsCrossed,
    items: [
      { href: routes.admin.categories, label: "Categorias", icon: FolderTree },
      { href: routes.admin.products, label: "Produtos", icon: ShoppingBag },
      { href: routes.admin.addons, label: "Complementos", icon: Boxes },
    ],
  },
  {
    id: "pedidos",
    label: "Pedidos",
    icon: ShoppingBag,
    href: routes.admin.orders,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    items: [
      { href: routes.admin.coupons, label: "Promoções e Cupons", icon: Tags },
      { href: routes.admin.tracking, label: "Links de Rastreamento", icon: Link2 },
    ],
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: Users,
    href: routes.admin.customers,
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    items: [
      { href: routes.admin.store, label: "Configuração da Loja", icon: Store },
      { href: routes.admin.delivery, label: "Entrega e Pagamento", icon: Truck },
    ],
  },
];

function sectionIdFromPath(pathname: string): string | null {
  if (pathname.startsWith("/admin/cardapio")) return "cardapio";
  if (pathname.startsWith("/admin/marketing")) return "marketing";
  if (pathname.startsWith("/admin/configuracoes")) return "configuracoes";
  return null;
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(() =>
    sectionIdFromPath(pathname),
  );
  const [seenPath, setSeenPath] = useState(pathname);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpenId(sectionIdFromPath(pathname));
  }

  function toggleSection(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <nav className="flex flex-col gap-3 overflow-x-hidden p-3">
      {sections.map((section) => {
        const Icon = section.icon;
        const hasChildren = Boolean(section.items?.length);
        const isOpen = openId === section.id;
        const childActive = section.items?.some((item) => pathname === item.href) ?? false;
        const directActive = section.href ? pathname === section.href : false;

        return (
          <div key={section.id} className="rounded-2xl bg-zinc-50 p-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold",
                  childActive
                    ? "bg-white text-brand"
                    : isOpen
                      ? "bg-white text-ink"
                      : "text-ink",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{section.label}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-zinc-400 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            ) : (
              <Link
                href={section.href ?? "#"}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                  directActive
                    ? "bg-brand text-white"
                    : "text-zinc-600 hover:bg-white",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{section.label}</span>
              </Link>
            )}

            {hasChildren ? (
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <ul className="mt-1 space-y-1">
                    {section.items?.map((item) => {
                      const ChildIcon = item.icon;
                      const active = pathname === item.href;
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
                            <ChildIcon className="size-4 shrink-0" />
                            <span className="min-w-0 truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
