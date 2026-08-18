"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ShoppingCart } from "lucide-react";

import { cartCount, readCart } from "@/lib/store-cart";
import { storefrontPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function StorefrontBottomNav({ slug, active }: { slug: string; active: "home" | "cart" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() {
      setCount(cartCount(readCart(slug)));
    }
    refresh();
    window.addEventListener("mipede-cart-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mipede-cart-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [slug]);

  const items = [
    { key: "home" as const, href: storefrontPath(slug), label: "Cardápio", icon: Home },
    { key: "cart" as const, href: `${storefrontPath(slug)}/carrinho`, label: "Carrinho", icon: ShoppingCart },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-100 bg-white/95 backdrop-blur-sm">
      <ul className="mx-auto grid max-w-3xl grid-cols-2 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium",
                  isActive ? "text-brand" : "text-zinc-400",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />
                {item.label}
                {item.key === "cart" && count > 0 ? (
                  <span className="absolute top-0 right-[calc(50%-18px)] rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">
                    {count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
