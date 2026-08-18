"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Admin = {
  id: string;
  name: string;
  emailMasked: string;
  role: string;
  status: string;
  createdAt: number;
  lastAccessAt: number | null;
};
type Invite = { id: string; name: string; emailMasked: string; status: string; expiresAt: number };

export function PlatformAdminsPanel() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);

  async function load() {
    const response = await fetch("/api/mipede/v1/platform/admins", { credentials: "include" });
    if (!response.ok) {
      setError("Não foi possível carregar os administradores.");
      return;
    }
    const payload = (await response.json()) as { admins: Admin[]; invites: Invite[] };
    setAdmins(payload.admins ?? []);
    setInvites(payload.invites ?? []);
  }

  if (!started) {
    setStarted(true);
    void load();
  }

  async function createInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/mipede/v1/platform/admins/invites", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") }),
    });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok) {
      setError("Não foi possível criar o convite.");
      return;
    }
    setInviteUrl(`${window.location.origin}${payload.url}`);
    setOpen(false);
    await load();
  }

  async function act(path: string) {
    const response = await fetch(path, { method: "POST", credentials: "include" });
    if (!response.ok) setError("Ação recusada.");
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Administradores</h1>
          <p className="mt-1 text-sm text-subtle">Somente o proprietário da plataforma gerencia a equipe interna.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Novo administrador</Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {inviteUrl ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium">Envie este link agora. Ele não será mostrado de novo.</p>
          <p className="mt-2 break-all">{inviteUrl}</p>
          <Button className="mt-3" size="sm" onClick={() => void navigator.clipboard.writeText(inviteUrl)}>
            Copiar link
          </Button>
          <Button className="mt-3 ml-2" size="sm" variant="ghost" onClick={() => setInviteUrl(null)}>
            Fechar
          </Button>
        </div>
      ) : null}

      {open ? (
        <form className="mt-6 max-w-md space-y-3 rounded-2xl border border-zinc-200 bg-white p-4" onSubmit={(event) => void createInvite(event)}>
          <h2 className="font-semibold">Novo administrador</h2>
          <Input name="name" placeholder="Nome" required />
          <Input name="email" type="email" placeholder="E-mail Google" required />
          <div className="flex gap-2">
            <Button type="submit">Gerar convite</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-100 text-xs uppercase text-subtle">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Entrada</th>
              <th className="px-4 py-3">Último acesso</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b border-zinc-50">
                <td className="px-4 py-3">{admin.name}</td>
                <td className="px-4 py-3">{admin.emailMasked}</td>
                <td className="px-4 py-3">{admin.role}</td>
                <td className="px-4 py-3">{admin.status}</td>
                <td className="px-4 py-3">{new Date(admin.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">{admin.lastAccessAt ? new Date(admin.lastAccessAt).toLocaleString("pt-BR") : "—"}</td>
                <td className="px-4 py-3">
                  {admin.role === "platform_admin" ? (
                    <div className="flex flex-wrap gap-1">
                      <Button size="xs" variant="outline" onClick={() => void act(`/api/mipede/v1/platform/admins/${admin.id}/suspend`)}>
                        Suspender
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => void act(`/api/mipede/v1/platform/admins/${admin.id}/reactivate`)}>
                        Reativar
                      </Button>
                      <Button size="xs" variant="destructive" onClick={() => void act(`/api/mipede/v1/platform/admins/${admin.id}/remove`)}>
                        Remover
                      </Button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Convites</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {invites.map((invite) => (
          <li key={invite.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <span>
              {invite.name} · {invite.emailMasked} · {invite.status}
            </span>
            {invite.status === "pending" ? (
              <Button size="xs" variant="outline" onClick={() => void act(`/api/mipede/v1/platform/admins/invites/${invite.id}/revoke`)}>
                Revogar
              </Button>
            ) : (
              <Button size="xs" variant="ghost" onClick={() => void act(`/api/mipede/v1/platform/admins/invites/${invite.id}/renew`)}>
                Gerar novo link
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
