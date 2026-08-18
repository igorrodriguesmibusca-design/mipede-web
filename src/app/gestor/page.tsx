import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";
import { getTenantView } from "@/server/session";

export default async function GestorIndexPage() {
  const tenant = await getTenantView();
  if (tenant.mode === "live" && tenant.store) {
    redirect(routes.managerFor(tenant.store.slug).root);
  }
  redirect(routes.manager.root);
}
