import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  up,
  icon: Icon,
  tone = "orange",
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  icon: LucideIcon;
  tone?: "orange" | "rose" | "green" | "amber" | "blue";
}) {
  const tones = {
    orange: "bg-orange-50 text-brand",
    rose: "bg-rose-50 text-rose-400",
    green: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    blue: "bg-sky-50 text-sky-500",
  };

  return (
    <article className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
      <div>
        <p className="text-sm text-subtle">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {delta ? (
          <p className={cn("mt-1 text-xs font-medium", up ? "text-success" : "text-red-500")}>
            {up ? "▲" : "▼"} {delta}
          </p>
        ) : null}
      </div>
      <span className={cn("flex size-12 items-center justify-center rounded-full", tones[tone])}>
        <Icon className="size-5" />
      </span>
    </article>
  );
}
