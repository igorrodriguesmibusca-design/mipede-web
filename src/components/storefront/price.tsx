import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PriceProps = {
  value: number;
  previous?: number;
  className?: string;
};

export function Price({ value, previous, className }: PriceProps) {
  return (
    <p className={cn("flex items-center gap-2 text-sm font-semibold", className)}>
      {previous ? (
        <span className="font-medium text-zinc-400 line-through">
          {formatCurrency(previous)}
        </span>
      ) : null}
      <span className="text-brand">{formatCurrency(value)}</span>
    </p>
  );
}
