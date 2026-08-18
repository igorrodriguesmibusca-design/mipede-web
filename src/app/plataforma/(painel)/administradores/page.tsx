import { PlatformAdminsPanel } from "@/components/platform/admins-panel";
import { getTenantView } from "@/server/session";

export default async function PlatformAdminsPage() {
  const tenant = await getTenantView();
  const canManageAdmins = tenant.mode === "live" && tenant.platformRole === "platform_owner";
  return <PlatformAdminsPanel canManageAdmins={canManageAdmins} />;
}
