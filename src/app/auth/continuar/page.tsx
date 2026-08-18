import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { routes } from "@/lib/routes";
import { BFF_SECRET_HEADER, bffSharedSecret } from "@/server/bff";
import { controlApiUrl } from "@/server/config";
import { isSafeInternalPath } from "@/server/redirects";

export default async function AuthContinuePage() {
  const base = controlApiUrl();
  const shared = bffSharedSecret();
  if (!base || !shared) redirect(routes.auth.login);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");

  let path: string = routes.auth.login;
  try {
    const response = await fetch(`${base}/api/mipede/v1/auth/destination`, {
      headers: {
        cookie: cookieHeader,
        [BFF_SECRET_HEADER]: shared,
      },
      cache: "no-store",
    });
    if (response.ok) {
      const payload = (await response.json()) as { path?: string };
      if (payload.path && isSafeInternalPath(payload.path)) path = payload.path;
    }
  } catch {
    path = routes.auth.login;
  }

  redirect(path);
}
