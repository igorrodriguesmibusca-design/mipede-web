import { redirect } from "next/navigation";

import { PlatformShell } from "@/components/platform/platform-shell";
import { TenantProvider } from "@/lib/tenant-context";
import { routes } from "@/lib/routes";
import { BFF_SECRET_HEADER, bffSharedSecret } from "@/server/bff";
import { controlApiUrl } from "@/server/config";
import { getTenantView } from "@/server/session";

async function tryBootstrap(): Promise<boolean> {
  const base = controlApiUrl();
  const shared = bffSharedSecret();
  if (!base || !shared) return false;
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const cookieHeader = store.getAll().map((item) => `${item.name}=${item.value}`).join("; ");
  const response = await fetch(`${base}/api/mipede/v1/platform/bootstrap`, {
    method: "POST",
    headers: { cookie: cookieHeader, [BFF_SECRET_HEADER]: shared, origin: "https://mipede-web.vercel.app" },
    cache: "no-store",
  }).catch(() => null);
  return Boolean(response?.ok);
}

export default async function PlatformConsoleLayout({ children }: { children: React.ReactNode }) {
  let tenant = await getTenantView();
  if (tenant.mode !== "live") redirect(routes.auth.login);
  if (tenant.canBootstrap) {
    const created = await tryBootstrap();
    if (created) tenant = await getTenantView();
  }
  if (tenant.mode !== "live" || (tenant.platformRole !== "platform_owner" && tenant.platformRole !== "platform_admin")) {
    return (
      <div className="min-h-dvh bg-zinc-50 px-5 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-6">
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-subtle">
            Este painel é exclusivo da equipe interna da MiPede. Se você é o primeiro proprietário, confirme que
            os secrets da plataforma estão configurados e entre novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TenantProvider value={tenant}>
      <PlatformShell role={tenant.platformRole} userName={tenant.user.name}>
        {children}
      </PlatformShell>
    </TenantProvider>
  );
}
