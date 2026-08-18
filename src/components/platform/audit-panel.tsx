"use client";

import { useState } from "react";

export function PlatformAuditPanel() {
  const [logs, setLogs] = useState<Array<{ id: string; action: string; created_at: number; actor_user_id?: string }>>([]);
  const [started, setStarted] = useState(false);
  if (!started) {
    setStarted(true);
    void fetch("/api/mipede/v1/platform/audit", { credentials: "include" })
      .then((response) => response.json())
      .then((payload: { logs?: typeof logs }) => setLogs(payload.logs ?? []));
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold">Auditoria</h1>
      <p className="mt-1 text-sm text-subtle">Ações administrativas sem tokens, cookies ou e-mails completos.</p>
      <ul className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
        {logs.length === 0 ? <li className="px-4 py-6 text-sm text-subtle">Nenhum evento.</li> : null}
        {logs.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <span>{item.action}</span>
            <span className="text-subtle">{new Date(item.created_at).toLocaleString("pt-BR")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
