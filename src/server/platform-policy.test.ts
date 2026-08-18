import { describe, expect, it } from "vitest";

import { generateInviteToken, hashInviteToken, maskEmail } from "./pii-crypto";
import {
  canAcceptInvite,
  canBootstrapOwner,
  canPerformPlatformAction,
  storeStatusAfterDecision,
} from "./platform-policy";
import { authorizeStoreAccess } from "./authorize";
import type { AuthContext } from "./roles";

const owner: Parameters<typeof canPerformPlatformAction>[0] = {
  userId: "igor",
  role: "platform_owner",
  status: "active",
};
const admin: Parameters<typeof canPerformPlatformAction>[0] = {
  userId: "admin",
  role: "platform_admin",
  status: "active",
};

describe("bootstrap", () => {
  it("autoriza o primeiro owner da allowlist", () => {
    expect(
      canBootstrapOwner({
        hasOwner: false,
        emailVerified: true,
        sessionEmail: "i.rodriguesc507@gmail.com",
        allowlist: ["i.rodriguesc507@gmail.com"],
      }).ok,
    ).toBe(true);
  });

  it("bloqueia segunda tentativa", () => {
    expect(
      canBootstrapOwner({
        hasOwner: true,
        emailVerified: true,
        sessionEmail: "i.rodriguesc507@gmail.com",
        allowlist: ["i.rodriguesc507@gmail.com"],
      }),
    ).toEqual({ ok: false, error: "already_bootstrapped" });
  });

  it("usuário público não vira platform_owner", () => {
    expect(
      canBootstrapOwner({
        hasOwner: false,
        emailVerified: true,
        sessionEmail: "loja@example.com",
        allowlist: ["i.rodriguesc507@gmail.com"],
      }).ok,
    ).toBe(false);
  });
});

describe("convites", () => {
  const base = {
    inviteStatus: "pending" as const,
    expiresAt: Date.now() + 60_000,
    inviteEmailHash: "aaa",
    sessionEmailHash: "aaa",
    googleVerified: true,
  };

  it("owner cria convite e admin não cria owner", () => {
    expect(canPerformPlatformAction(owner, "invite_admin").ok).toBe(true);
    expect(canPerformPlatformAction(admin, "invite_admin").ok).toBe(false);
  });

  it("e-mail diferente não consome convite", () => {
    expect(canAcceptInvite({ ...base, sessionEmailHash: "bbb" }).ok).toBe(false);
  });

  it("e-mail Google não verificado não consome", () => {
    expect(canAcceptInvite({ ...base, googleVerified: false }).ok).toBe(false);
  });

  it("convite expirado ou revogado ou reutilizado é recusado", () => {
    expect(canAcceptInvite({ ...base, expiresAt: Date.now() - 1 }).ok).toBe(false);
    expect(canAcceptInvite({ ...base, inviteStatus: "revoked" }).ok).toBe(false);
    expect(canAcceptInvite({ ...base, inviteStatus: "accepted" }).ok).toBe(false);
  });

  it("token não é o valor armazenado", async () => {
    const token = generateInviteToken();
    const hashed = await hashInviteToken(token);
    expect(hashed).not.toBe(token);
    expect(hashed).toHaveLength(64);
    expect(token.length).toBeGreaterThanOrEqual(32);
  });
});

describe("papéis globais", () => {
  it("admin suspenso perde acesso", () => {
    expect(canPerformPlatformAction({ ...admin, status: "suspended" }, "access_panel").ok).toBe(false);
  });

  it("último owner não pode ser removido", () => {
    expect(
      canPerformPlatformAction(owner, "remove_admin", { userId: "igor", role: "platform_owner", isLastOwner: true }),
    ).toEqual({ ok: false, status: 403, error: "last_owner" });
  });

  it("admin não modifica owner", () => {
    expect(canPerformPlatformAction(admin, "remove_admin", { role: "platform_owner" }).ok).toBe(false);
  });

  it("aprovação muda para ACTIVE", () => {
    expect(storeStatusAfterDecision("approve")).toBe("ACTIVE");
  });
});

describe("contextos separados", () => {
  const storeOwner: AuthContext = {
    userId: "igor",
    email: "i@x.test",
    emailVerified: true,
    platformRole: "platform_owner",
    memberships: [
      { organizationId: "org-a", storeId: "store-a", storeSlug: "loja-a", storeStatus: "ACTIVE", role: "owner" },
    ],
  };

  it("owner da loja sem papel global não acessa plataforma", () => {
    expect(
      canPerformPlatformAction(null, "access_panel").ok,
    ).toBe(false);
  });

  it("platform_owner pode ser owner da loja sem misturar isolamento", () => {
    expect(storeOwner.platformRole).toBe("platform_owner");
    expect(storeOwner.memberships[0]?.role).toBe("owner");
    expect(authorizeStoreAccess(storeOwner, { storeId: "store-b" }).ok).toBe(false);
  });

  it("e-mail é mascarado", () => {
    expect(maskEmail("i.rodriguesc507@gmail.com")).toBe("i***@gmail.com");
  });
});
