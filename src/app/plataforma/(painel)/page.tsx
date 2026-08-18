import { PlatformDashboard } from "@/components/platform/platform-dashboard";
import { getTenantView } from "@/server/session";

export default async function PlatformHomePage() {
  const tenant = await getTenantView();
  const userName = tenant.mode === "live" ? tenant.user.name : "";
  return <PlatformDashboard userName={userName} />;
}
