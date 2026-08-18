"use client";

import { type PeriodKey, periodLabels } from "@/data/mock-analytics";
import { cn } from "@/lib/utils";

const keys: PeriodKey[] = ["hoje", "7d", "30d"];

export function PeriodSelector({
  value,
  onChange,
  extra,
}: {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
  extra?: { id: string; label: string; active?: boolean; onSelect?: () => void };
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm",
            value === key && !extra?.active
              ? "bg-brand font-semibold text-white"
              : "text-zinc-500",
          )}
        >
          {periodLabels[key]}
        </button>
      ))}
      {extra ? (
        <button
          type="button"
          onClick={extra.onSelect}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm",
            extra.active ? "bg-brand font-semibold text-white" : "text-zinc-500",
          )}
        >
          {extra.label}
        </button>
      ) : null}
    </div>
  );
}
