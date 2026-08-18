import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function PlatformIndexPage() {
  redirect(routes.platform.stores);
}
