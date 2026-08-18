"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function PlatformStoreDetail({ storeId }: { storeId: string }) {
  const [payload, setPayload] = useState<{
    store?: Record<string, string | number | null>;
    history?: Array<{ id: string; action: string; created_at: number }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function load() {
    const response = await fetch(`/api/mipede/v1/platform/stores/${storeId}`, { credentials: "include" });
    if (!response.ok) {
      setError("Não foi possível carregar o estabelecimento.");
      return;
    }
    setPayload(await response.json());
  }

  if (!started) {
    setStarted(true);
    void load();
  }

  async function decide(action: "approve" | "reject" | "suspend" | "reactivate") {
    const reason =
      action === "reject" || action === "suspend" ? window.prompt("Motivo") ?? "" : undefined;
    const response = await fetch(`/api/mipede/v1/platform/stores/${storeId}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    if (!response.ok) {
      setError("Ação recusada.");
      return;
    }
    await load();
  }

  const store = payload?.store;
  return (
    <div>
      <h1 className="text-2xl font-semibold">{String(store?.name ?? "Estabelecimento")}</h1>
      <p className="mt-1 text-sm text-subtle">{String(store?.slug ?? "")}</p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <dl className="mt-6 grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
        <div className="flex justify-between"><dt>Status</dt><dd>{String(store?.status ?? "—")}</dd></div>
        <div className="flex justify-between"><dt>Onboarding</dt><dd>{String(store?.onboarding_status ?? "—")}</dd></div>
        <div className="flex justify-between"><dt>Cidade</dt><dd>{String(store?.city ?? "—")}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void decide("approve")}>Aprovar</Button>
        <Button size="sm" variant="outline" onClick={() => void decide("reject")}>Rejeitar</Button>
        <Button size="sm" variant="outline" onClick={() => void decide("suspend")}>Suspender</Button>
        <Button size="sm" variant="ghost" onClick={() => void decide("reactivate")}>Reativar</Button>
      </div>
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Histórico</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(payload?.history ?? []).map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.action}</span>
              <span className="text-subtle">{new Date(item.created_at).toLocaleString("pt-BR")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
