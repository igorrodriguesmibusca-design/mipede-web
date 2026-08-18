import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  href: string;
  className?: string;
};

export function PageHeader({ title, href, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3",
        className,
      )}
    >
      <Link
        href={href}
        aria-label="Voltar"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white"
      >
        <ChevronLeft className="size-6" />
      </Link>
      <h1 className="truncate text-lg font-semibold text-brand">{title}</h1>
    </header>
  );
}
