import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const tones = {
  orange: "bg-orange-50 text-brand",
  amber: "bg-amber-50 text-amber-500",
  green: "bg-emerald-50 text-emerald-500",
  rose: "bg-rose-50 text-rose-500",
  blue: "bg-sky-50 text-sky-500",
} as const;

export function PlatformMetricCard({
  label,
  value,
  description,
  icon: Icon,
  href,
  tone = "orange",
}: {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  href?: string;
  tone?: keyof typeof tones;
}) {
  const content = (
    <article className="flex h-full items-start justify-between gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
      <div className="min-w-0">
        <p className="text-sm text-subtle">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {description ? <p className="mt-1 text-xs text-subtle">{description}</p> : null}
      </div>
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", tones[tone])}>
        <Icon className="size-5" />
      </span>
    </article>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block h-full transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}
