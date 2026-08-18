import { AdminShell } from "@/components/admin/admin-shell";
import { TenantPanelGate } from "@/components/admin/tenant-panel-gate";
import { TenantProvider } from "@/lib/tenant-context";
import { getTenantView } from "@/server/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantView();
  return (
    <TenantProvider value={tenant}>
      <AdminShell>
        <TenantPanelGate area="admin">{children}</TenantPanelGate>
      </AdminShell>
    </TenantProvider>
  );
}
