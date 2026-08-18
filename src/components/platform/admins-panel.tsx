"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Shield, ShieldCheck, UserX } from "lucide-react";

import { PlatformActionMenu } from "@/components/platform/platform-action-menu";
import { PlatformConfirmationDialog } from "@/components/platform/platform-confirmation-dialog";
import { PlatformDataTable } from "@/components/platform/platform-data-table";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformMetricCard } from "@/components/platform/platform-metric-card";
import { PlatformPageHeader } from "@/components/platform/platform-page-header";
import { PlatformRoleBadge } from "@/components/platform/platform-role-badge";
import { PlatformStatusBadge } from "@/components/platform/platform-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPlatformDate, formatPlatformDateTime, inviteStatusLabel } from "@/lib/platform-labels";

type Admin = {
  id: string;
  name: string;
  emailMasked: string;
  role: string;
  status: string;
  createdAt: number;
  lastAccessAt: number | null;
};

type Invite = {
  id: string;
  name: string;
  emailMasked: string;
  status: string;
  createdAt?: number;
  expiresAt: number;
};

type ConfirmState =
  | { kind: "suspend"; admin: Admin }
  | { kind: "reactivate"; admin: Admin }
  | { kind: "remove"; admin: Admin }
  | { kind: "revoke"; invite: Invite }
  | { kind: "renew"; invite: Invite };

export function PlatformAdminsPanel({ canManageAdmins }: { canManageAdmins: boolean }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

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

  useEffect(() => {
    void fetch("/api/mipede/v1/platform/admins", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { admins?: Admin[]; invites?: Invite[] } | null) => {
        if (!payload) {
          setError("Não foi possível carregar os administradores.");
          return;
        }
        setAdmins(payload.admins ?? []);
        setInvites(payload.invites ?? []);
      });
  }, []);

  async function createInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/mipede/v1/platform/admins/invites", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") }),
    });
    const payload = (await response.json().catch(() => ({}))) as { url?: string };
    setBusy(false);
    if (!response.ok) {
      setError("Não foi possível criar o convite.");
      return;
    }
    if (payload.url) setInviteUrl(`${window.location.origin}${payload.url}`);
    setOpen(false);
    await load();
  }

  async function act(path: string): Promise<{ url?: string } | null> {
    setBusy(true);
    setError(null);
    const response = await fetch(path, { method: "POST", credentials: "include" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string };
    setBusy(false);
    if (!response.ok) {
      setError("A ação não pôde ser concluída.");
      return null;
    }
    return payload;
  }

  const counts = useMemo(
    () => ({
      active: admins.filter((admin) => admin.status === "active").length,
      owners: admins.filter((admin) => admin.role === "platform_owner").length,
      pending: invites.filter((invite) => invite.status === "pending").length,
      suspended: admins.filter((admin) => admin.status === "suspended").length,
    }),
    [admins, invites],
  );

  const confirmation = confirmCopy(confirm);

  return (
    <div>
      <PlatformPageHeader
        title="Administradores"
        description="Gerencie quem pode acessar o Painel da Plataforma MiPede."
        action={
          canManageAdmins ? (
            <Button type="button" onClick={() => setOpen(true)}>
              Adicionar administrador
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformMetricCard label="Administradores ativos" value={counts.active} icon={Shield} tone="green" />
        <PlatformMetricCard label="Proprietários da plataforma" value={counts.owners} icon={ShieldCheck} tone="orange" />
        <PlatformMetricCard label="Convites pendentes" value={counts.pending} icon={Mail} tone="amber" />
        <PlatformMetricCard label="Administradores suspensos" value={counts.suspended} icon={UserX} tone="rose" />
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {inviteUrl ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium">Envie este link agora. Ele não será mostrado de novo.</p>
          <p className="mt-2 break-all">{inviteUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void navigator.clipboard.writeText(inviteUrl)}>
              Copiar link
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setInviteUrl(null)}>
              Fechar
            </Button>
          </div>
        </div>
      ) : null}

      {open ? (
        <form
          className="mt-6 max-w-md space-y-3 rounded-2xl border border-zinc-100 bg-white p-4"
          onSubmit={(event) => void createInvite(event)}
        >
          <h2 className="font-semibold">Adicionar administrador</h2>
          <p className="text-sm text-subtle">A pessoa entra com a conta Google do e-mail convidado.</p>
          <Input name="name" placeholder="Nome" required />
          <Input name="email" type="email" placeholder="E-mail Google" required />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              Gerar convite
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Administradores ativos</h2>
        <div className="rounded-2xl border border-zinc-100 bg-white">
          <PlatformDataTable
            rows={admins.filter((admin) => admin.status !== "suspended")}
            rowKey={(admin) => admin.id}
            empty={
              <PlatformEmptyState
                title="Nenhum administrador ativo"
                description="Os administradores da plataforma aparecerão aqui."
              />
            }
            mobileTitle={(admin) => admin.name}
            columns={[
              { id: "name", header: "Administrador", cell: (admin) => <span className="font-medium">{admin.name}</span>, mobile: false },
              { id: "email", header: "E-mail", cell: (admin) => admin.emailMasked },
              { id: "role", header: "Papel", cell: (admin) => <PlatformRoleBadge role={admin.role} /> },
              { id: "status", header: "Status", cell: (admin) => <PlatformStatusBadge kind="admin" value={admin.status} /> },
              { id: "joined", header: "Data de entrada", cell: (admin) => formatPlatformDate(admin.createdAt) },
              {
                id: "access",
                header: "Último acesso",
                cell: (admin) => (admin.lastAccessAt ? formatPlatformDateTime(admin.lastAccessAt) : "Não informado"),
              },
              {
                id: "actions",
                header: "Ações",
                cell: (admin) =>
                  canManageAdmins && admin.role === "platform_admin" ? (
                    <PlatformActionMenu
                      items={[
                        { id: "suspend", label: "Suspender", onSelect: () => setConfirm({ kind: "suspend", admin }) },
                        {
                          id: "remove",
                          label: "Remover",
                          destructive: true,
                          onSelect: () => setConfirm({ kind: "remove", admin }),
                        },
                      ]}
                    />
                  ) : (
                    <span className="text-subtle">—</span>
                  ),
              },
            ]}
          />
        </div>
      </section>

      {admins.some((admin) => admin.status === "suspended") ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Administradores suspensos</h2>
          <div className="rounded-2xl border border-zinc-100 bg-white">
            <PlatformDataTable
              rows={admins.filter((admin) => admin.status === "suspended")}
              rowKey={(admin) => admin.id}
              empty={null}
              mobileTitle={(admin) => admin.name}
              columns={[
                { id: "name", header: "Administrador", cell: (admin) => <span className="font-medium">{admin.name}</span>, mobile: false },
                { id: "email", header: "E-mail", cell: (admin) => admin.emailMasked },
                { id: "role", header: "Papel", cell: (admin) => <PlatformRoleBadge role={admin.role} /> },
                { id: "status", header: "Status", cell: (admin) => <PlatformStatusBadge kind="admin" value={admin.status} /> },
                { id: "joined", header: "Data de entrada", cell: (admin) => formatPlatformDate(admin.createdAt) },
                {
                  id: "actions",
                  header: "Ações",
                  cell: (admin) =>
                    canManageAdmins ? (
                      <PlatformActionMenu
                        items={[
                          { id: "reactivate", label: "Reativar", onSelect: () => setConfirm({ kind: "reactivate", admin }) },
                          {
                            id: "remove",
                            label: "Remover",
                            destructive: true,
                            onSelect: () => setConfirm({ kind: "remove", admin }),
                          },
                        ]}
                      />
                    ) : (
                      <span className="text-subtle">—</span>
                    ),
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Convites</h2>
        <div className="rounded-2xl border border-zinc-100 bg-white">
          <PlatformDataTable
            rows={invites}
            rowKey={(invite) => invite.id}
            empty={
              <PlatformEmptyState title="Nenhum convite" description="Os convites gerados para a equipe interna aparecerão aqui." />
            }
            mobileTitle={(invite) => invite.name}
            columns={[
              { id: "name", header: "Nome", cell: (invite) => <span className="font-medium">{invite.name}</span>, mobile: false },
              { id: "email", header: "E-mail", cell: (invite) => invite.emailMasked },
              { id: "role", header: "Papel", cell: () => <PlatformRoleBadge role="platform_admin" /> },
              { id: "created", header: "Data de criação", cell: (invite) => formatPlatformDate(invite.createdAt) },
              { id: "expires", header: "Validade", cell: (invite) => formatPlatformDateTime(invite.expiresAt) },
              { id: "status", header: "Status", cell: (invite) => <PlatformStatusBadge kind="invite" value={invite.status} /> },
              {
                id: "actions",
                header: "Ações",
                cell: (invite) =>
                  canManageAdmins ? (
                    <PlatformActionMenu
                      items={
                        invite.status === "pending"
                          ? [{ id: "revoke", label: "Revogar", destructive: true, onSelect: () => setConfirm({ kind: "revoke", invite }) }]
                          : [{ id: "renew", label: "Gerar novo convite", onSelect: () => setConfirm({ kind: "renew", invite }) }]
                      }
                    />
                  ) : (
                    <span className="text-subtle">{inviteStatusLabel(invite.status)}</span>
                  ),
              },
            ]}
          />
        </div>
      </section>

      <PlatformConfirmationDialog
        open={Boolean(confirm)}
        title={confirmation.title}
        description={confirmation.description}
        confirmLabel={confirmation.confirmLabel}
        destructive={confirmation.destructive}
        pending={busy}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.kind === "suspend") await act(`/api/mipede/v1/platform/admins/${confirm.admin.id}/suspend`);
          if (confirm.kind === "reactivate") await act(`/api/mipede/v1/platform/admins/${confirm.admin.id}/reactivate`);
          if (confirm.kind === "remove") await act(`/api/mipede/v1/platform/admins/${confirm.admin.id}/remove`);
          if (confirm.kind === "revoke") await act(`/api/mipede/v1/platform/admins/invites/${confirm.invite.id}/revoke`);
          if (confirm.kind === "renew") {
            const payload = await act(`/api/mipede/v1/platform/admins/invites/${confirm.invite.id}/renew`);
            if (payload?.url) setInviteUrl(`${window.location.origin}${payload.url}`);
          }
          setConfirm(null);
          await load();
        }}
      />
    </div>
  );
}

function confirmCopy(confirm: ConfirmState | null) {
  if (!confirm) {
    return { title: "", description: "", confirmLabel: "Confirmar", destructive: false };
  }
  if (confirm.kind === "suspend") {
    return {
      title: `Deseja suspender ${confirm.admin.name}?`,
      description: "A pessoa perde o acesso ao painel interno até ser reativada.",
      confirmLabel: "Suspender",
      destructive: true,
    };
  }
  if (confirm.kind === "reactivate") {
    return {
      title: `Deseja reativar ${confirm.admin.name}?`,
      description: "O acesso ao Painel da Plataforma será restaurado.",
      confirmLabel: "Reativar",
      destructive: false,
    };
  }
  if (confirm.kind === "remove") {
    return {
      title: `Deseja remover ${confirm.admin.name}?`,
      description: "Essa pessoa deixa de fazer parte da equipe interna da plataforma.",
      confirmLabel: "Remover",
      destructive: true,
    };
  }
  if (confirm.kind === "revoke") {
    return {
      title: `Deseja revogar o convite de ${confirm.invite.name}?`,
      description: "O link deixa de funcionar imediatamente.",
      confirmLabel: "Revogar convite",
      destructive: true,
    };
  }
  return {
    title: `Deseja gerar um novo convite para ${confirm.invite.name}?`,
    description: "O convite anterior deixa de valer e um novo link será gerado.",
    confirmLabel: "Gerar novo convite",
    destructive: false,
  };
}
