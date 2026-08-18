import { describe, expect, it } from "vitest";

import { authorizePlatform, authorizeStoreAccess, rejectRoleEscalation } from "./authorize";
import type { AuthContext } from "./roles";

const operatorA: AuthContext = {
  userId: "op-a",
  email: "op@loja-a.test",
  emailVerified: true,
  platformRole: null,
  memberships: [
    {
      organizationId: "org-a",
      storeId: "store-a",
      storeSlug: "loja-a",
      storeStatus: "ACTIVE",
      role: "operator",
    },
  ],
};

const adminA: AuthContext = {
  userId: "admin-a",
  email: "admin@loja-a.test",
  emailVerified: true,
  platformRole: null,
  memberships: [
    {
      organizationId: "org-a",
      storeId: "store-a",
      storeSlug: "loja-a",
      storeStatus: "ACTIVE",
      role: "admin",
    },
  ],
};

const platform: AuthContext = {
  userId: "plat",
  email: "ops@mipede.app",
  emailVerified: true,
  platformRole: "platform_admin",
  memberships: [],
};

describe("autorização", () => {
  it("recusa sessão ausente", () => {
    expect(authorizeStoreAccess(null, { storeId: "store-a" }).ok).toBe(false);
  });

  it("operador não vê faturamento", () => {
    const decision = authorizeStoreAccess(operatorA, { storeId: "store-a" }, "view_finance");
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(403);
  });

  it("administrador não transfere propriedade", () => {
    const decision = authorizeStoreAccess(adminA, { storeId: "store-a" }, "transfer_ownership");
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(403);
  });

  it("operador não vira owner por mass assignment de role", () => {
    expect(rejectRoleEscalation("operator", "owner")).toBe(true);
    expect(rejectRoleEscalation("admin", "owner")).toBe(true);
    expect(rejectRoleEscalation("owner", "owner")).toBe(false);
  });

  it("cadastro público não cria platform_admin", () => {
    expect(rejectRoleEscalation("owner", "platform_admin")).toBe(true);
    expect(authorizePlatform(adminA).ok).toBe(false);
    expect(authorizePlatform(platform).ok).toBe(true);
  });

  it("e-mail não verificado não acessa o painel", () => {
    const pending = { ...adminA, emailVerified: false };
    const decision = authorizeStoreAccess(pending, { storeId: "store-a" });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.error).toBe("email_unverified");
  });
});
