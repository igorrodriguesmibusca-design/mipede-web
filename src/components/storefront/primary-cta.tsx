import Link from "next/link";

import { cn } from "@/lib/utils";

type PrimaryCtaProps = {
  href?: string;
  label: string;
  value?: string;
  disabled?: boolean;
  className?: string;
};

export function PrimaryCta({
  href,
  label,
  value,
  disabled = false,
  className,
}: PrimaryCtaProps) {
  const classes = cn(
    "flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold",
    disabled ? "bg-zinc-400 text-white" : "bg-brand text-white hover:bg-brand-hover",
    value && "justify-between",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        <span>{label}</span>
        {value ? <span>{value}</span> : null}
      </Link>
    );
  }

  return (
    <button type="button" disabled={disabled} className={classes}>
      <span>{label}</span>
      {value ? <span>{value}</span> : null}
    </button>
  );
}
