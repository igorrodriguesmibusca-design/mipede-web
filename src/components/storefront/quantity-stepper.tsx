export function QuantityStepper({ value = 1 }: { value?: number }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-200">
      <span className="flex size-8 items-center justify-center text-lg text-zinc-400">−</span>
      <span className="min-w-6 text-center text-sm font-semibold">{value}</span>
      <span className="flex size-8 items-center justify-center text-lg text-brand">+</span>
    </div>
  );
}
