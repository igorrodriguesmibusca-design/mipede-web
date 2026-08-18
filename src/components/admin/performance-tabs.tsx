"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const tabs = [
  { href: routes.admin.performance, label: "Vendas", exact: true },
  { href: routes.admin.performanceMenu, label: "Cardápio", exact: true },
  { href: routes.admin.performanceCancellations, label: "Cancelamentos", exact: true },
];

export function PerformanceTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm",
              active ? "bg-white font-semibold text-brand" : "text-zinc-500",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
