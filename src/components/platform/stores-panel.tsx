"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  onboarding_status: string;
  provisioning_status: string;
  city: string | null;
  created_at: number;
  owner_name?: string;
  owner_email?: string;
};

export function PlatformStoresPanel() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function load() {
    const response = await fetch("/api/mipede/v1/platform/stores", { credentials: "include" });
    if (!response.ok) {
      setError("Não foi possível carregar os estabelecimentos.");
      return;
    }
    const payload = (await response.json()) as { stores: StoreRow[] };
    setStores(payload.stores ?? []);
  }

  if (!started) {
    setStarted(true);
    void load();
  }

  async function decide(id: string, action: "approve" | "reject" | "suspend" | "reactivate") {
    const reason = action === "reject" ? window.prompt("Justificativa da recusa") ?? "" : undefined;
    const response = await fetch(`/api/mipede/v1/platform/stores/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    if (!response.ok) {
      setError("Ação recusada pelo servidor.");
      return;
    }
    await load();
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
      {error ? <p className="px-4 pt-4 text-sm text-red-600">{error}</p> : null}
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-100 text-xs tracking-wide text-subtle uppercase">
          <tr>
            <th className="px-4 py-3">Loja</th>
            <th className="px-4 py-3">Proprietário</th>
            <th className="px-4 py-3">Cadastro</th>
            <th className="px-4 py-3">Onboarding</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Provisionamento</th>
            <th className="px-4 py-3">Cidade</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {stores.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-subtle">
                Nenhum estabelecimento enviado para análise.
              </td>
            </tr>
          ) : (
            stores.map((store) => (
              <tr key={store.id} className="border-b border-zinc-50">
                <td className="px-4 py-3 font-medium">
                  <a href={`/plataforma/estabelecimentos/${store.id}`} className="hover:underline">
                    {store.name}
                  </a>
                  <div className="text-xs text-subtle">{store.slug}</div>
                </td>
                <td className="px-4 py-3">{store.owner_name ?? "—"}</td>
                <td className="px-4 py-3">{new Date(store.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">{store.onboarding_status}</td>
                <td className="px-4 py-3">{store.status}</td>
                <td className="px-4 py-3">{store.provisioning_status}</td>
                <td className="px-4 py-3">{store.city ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button size="xs" onClick={() => void decide(store.id, "approve")}>
                      Aprovar
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => void decide(store.id, "reject")}>
                      Rejeitar
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => void decide(store.id, "suspend")}>
                      Suspender
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => void decide(store.id, "reactivate")}>
                      Reativar
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
