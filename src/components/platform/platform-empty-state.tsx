import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function PlatformEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-subtle">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
