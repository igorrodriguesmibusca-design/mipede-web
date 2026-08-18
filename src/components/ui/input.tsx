import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:focus:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
