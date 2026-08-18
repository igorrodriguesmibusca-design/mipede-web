import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { routes } from "@/lib/routes";

type EmptyStateProps = {
  icon: LucideIcon;
  message: string;
};

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <Icon className="mb-4 size-10 text-zinc-300" strokeWidth={1.4} />
      <p className="mb-5 max-w-[16rem] text-sm text-zinc-400">{message}</p>
      <Link
        href={routes.store.home}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand"
      >
        Ir para o menu
      </Link>
    </div>
  );
}
