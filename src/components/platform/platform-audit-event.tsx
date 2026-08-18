"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { auditEventLabel, formatPlatformDateTime, resourceTypeLabel, safeAuditDetails } from "@/lib/platform-labels";
import { cn } from "@/lib/utils";

export type PlatformAuditLog = {
  id: string;
  action: string;
  created_at: number;
  actor_user_id?: string | null;
  resource_type?: string | null;
  resource_id?: string | null;
};

export function PlatformAuditEvent({ log }: { log: PlatformAuditLog }) {
  const [open, setOpen] = useState(false);
  const details = safeAuditDetails({
    resource_type: log.resource_type ?? undefined,
    resource_id: log.resource_id ?? undefined,
  });

  return (
    <div>
      <button
        type="button"
        className="grid w-full grid-cols-1 items-start gap-2 px-4 py-3 text-left hover:bg-zinc-50 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="font-medium">{auditEventLabel(log.action)}</p>
          <p className="mt-0.5 text-xs text-subtle md:hidden">
            {resourceTypeLabel(log.resource_type)} · Equipe MiPede
          </p>
        </div>
        <span className="hidden text-sm md:block">Equipe MiPede</span>
        <span className="hidden text-sm md:block">{resourceTypeLabel(log.resource_type)}</span>
        <span className="text-xs text-subtle md:text-sm">{formatPlatformDateTime(log.created_at)}</span>
        <ChevronDown className={cn("hidden size-4 text-zinc-400 transition-transform md:block", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="px-4 pb-4 text-sm">
          {details.length === 0 ? (
            <p className="text-subtle">Sem detalhes adicionais para este evento.</p>
          ) : (
            <dl className="space-y-1 rounded-xl bg-zinc-50 px-3 py-2">
              {details.map((item) => (
                <div key={item.label} className="flex justify-between gap-3">
                  <dt className="text-subtle">{item.label}</dt>
                  <dd className={item.label === "Identificador interno" ? "text-xs text-zinc-400" : ""}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ) : null}
    </div>
  );
}
