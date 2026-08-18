import Link from "next/link";
import { Home, ShoppingCart, Tag, ClipboardList } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NavKey = "home" | "coupons" | "orders" | "cart";

const items: {
  key: NavKey;
  href: string;
  label: string;
  icon: typeof Home;
}[] = [
  { key: "home", href: routes.store.home, label: "Home", icon: Home },
  { key: "coupons", href: routes.store.coupons, label: "Cupons", icon: Tag },
  { key: "orders", href: routes.store.orders, label: "Pedidos", icon: ClipboardList },
  { key: "cart", href: routes.store.cart, label: "Carrinho", icon: ShoppingCart },
];

export function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-100 bg-white/95 backdrop-blur-sm">
      <ul className="mx-auto grid max-w-3xl grid-cols-4 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium",
                  isActive ? "text-brand" : "text-zinc-400",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
