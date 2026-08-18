import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand/10 text-brand",
        success: "border-transparent bg-emerald-50 text-emerald-600",
        warning: "border-transparent bg-amber-50 text-amber-600",
        muted: "border-transparent bg-zinc-100 text-zinc-500",
        danger: "border-transparent bg-red-50 text-red-600",
        info: "border-transparent bg-sky-50 text-sky-600",
        outline: "border-zinc-200 bg-white text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
