import { PlatformStoresPanel } from "@/components/platform/stores-panel";
import { getTenantView } from "@/server/session";

export default async function PlatformStoresPage() {
  const tenant = await getTenantView();
  const allowed = tenant.mode === "live" && tenant.platformRole === "platform_admin";

  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-sm font-medium text-brand">Painel interno MiPede</p>
        <h1 className="mt-2 text-3xl font-semibold">Estabelecimentos</h1>
        <p className="mt-2 max-w-2xl text-sm text-subtle">
          Aprovação, suspensão e auditoria técnica. Esta área nunca fica disponível no cadastro público.
        </p>
        {allowed ? (
          <PlatformStoresPanel />
        ) : (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Acesso restrito</h2>
            <p className="mt-2 text-sm text-subtle">
              Somente `platform_admin` definido por secret do servidor pode ver e decidir sobre estabelecimentos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
