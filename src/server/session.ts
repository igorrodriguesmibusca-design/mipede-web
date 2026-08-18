import { cookies } from "next/headers";

import { BFF_SECRET_HEADER, bffSharedSecret } from "./bff";
import { allowVisualDemo, controlApiUrl, SESSION_COOKIE_NAMES } from "./config";
import type { StoreRole, StoreStatus } from "./roles";

export type TenantView =
  | { mode: "demo" }
  | { mode: "anonymous" }
  | {
      mode: "live";
      user: { id: string; name: string; email: string; emailVerified: boolean };
      platformRole: "platform_admin" | null;
      store: {
        organizationId: string;
        storeId: string;
        name: string;
        slug: string;
        status: StoreStatus;
        onboardingStatus: string;
        role: StoreRole;
      } | null;
    };

type MeResponse = {
  user?: { id: string; name: string; email: string; emailVerified: boolean };
  platformRole?: "platform_admin" | null;
  store?: TenantView extends { mode: "live" } ? TenantView["store"] : never;
};

export function requestHasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return SESSION_COOKIE_NAMES.some((name) => cookieHeader.includes(`${name}=`));
}

export async function getTenantView(): Promise<TenantView> {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
  const base = controlApiUrl();

  if (base && requestHasSessionCookie(cookieHeader)) {
    try {
      const headers: HeadersInit = { cookie: cookieHeader };
      const shared = bffSharedSecret();
      if (shared) headers[BFF_SECRET_HEADER] = shared;
      const response = await fetch(`${base}/api/mipede/v1/me`, {
        headers,
        cache: "no-store",
      });
      if (response.ok) {
        const payload = (await response.json()) as MeResponse;
        if (payload.user) {
          return {
            mode: "live",
            user: payload.user,
            platformRole: payload.platformRole ?? null,
            store: payload.store ?? null,
          };
        }
      }
    } catch {
      // Worker ausente: cai no modo visual se permitido.
    }
  }

  return { mode: allowVisualDemo() ? "demo" : "anonymous" };
}
