"use client";

export function QuantityStepper({
  value = 1,
  onChange,
  min = 1,
  max = 99,
}: {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-200">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        className="flex size-8 items-center justify-center text-lg text-zinc-400"
        onClick={() => onChange?.(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        className="flex size-8 items-center justify-center text-lg text-brand"
        onClick={() => onChange?.(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}
