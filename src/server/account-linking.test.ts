import { describe, expect, it } from "vitest";

import { decideGoogleAccountLink } from "./account-linking";
import { authorizeStoreAccess, rejectRoleEscalation } from "./authorize";
import type { AuthContext } from "./roles";

const existing = { id: "user-a", email: "Dona@Loja.test", emailVerified: false };

describe("vinculação Google", () => {
  it("usuário inexistente com Google verificado cria conta", () => {
    expect(
      decideGoogleAccountLink({
        googleEmail: "nova@loja.test",
        googleEmailVerified: true,
        existingUser: null,
        existingGoogleAccount: false,
      }),
    ).toEqual({ action: "create" });
  });

  it("usuário credential existente com o mesmo e-mail verificado é vinculado", () => {
    expect(
      decideGoogleAccountLink({
        googleEmail: "dona@loja.test",
        googleEmailVerified: true,
        existingUser: existing,
        existingGoogleAccount: false,
      }),
    ).toEqual({ action: "link", userId: "user-a" });
  });

  it("não duplica o usuário e preserva o userId", () => {
    const first = decideGoogleAccountLink({
      googleEmail: "dona@loja.test",
      googleEmailVerified: true,
      existingUser: existing,
      existingGoogleAccount: false,
    });
    const second = decideGoogleAccountLink({
      googleEmail: "dona@loja.test",
      googleEmailVerified: true,
      existingUser: existing,
      existingGoogleAccount: true,
    });
    expect(first).toEqual({ action: "link", userId: "user-a" });
    expect(second).toEqual({ action: "reuse", userId: "user-a" });
  });

  it("e-mail diferente não vincula", () => {
    expect(
      decideGoogleAccountLink({
        googleEmail: "outra@loja.test",
        googleEmailVerified: true,
        existingUser: existing,
        existingGoogleAccount: false,
      }),
    ).toEqual({ action: "reject", reason: "email_mismatch" });
  });

  it("Google sem e-mail verificado é rejeitado", () => {
    expect(
      decideGoogleAccountLink({
        googleEmail: "dona@loja.test",
        googleEmailVerified: false,
        existingUser: existing,
        existingGoogleAccount: false,
      }),
    ).toEqual({ action: "reject", reason: "unverified_google" });
  });
});

describe("isolamento após login Google", () => {
  const ownerA: AuthContext = {
    userId: "user-a",
    email: "a@loja.test",
    emailVerified: true,
    platformRole: null,
    memberships: [
      { organizationId: "org-a", storeId: "store-a", storeSlug: "loja-a", storeStatus: "ACTIVE", role: "owner" },
    ],
  };
  const operatorA: AuthContext = {
    ...ownerA,
    userId: "op-a",
    memberships: [{ ...ownerA.memberships[0], role: "operator" }],
  };

  it("Loja A não acessa Loja B", () => {
    const decision = authorizeStoreAccess(ownerA, { storeId: "store-b" });
    expect(decision.ok).toBe(false);
  });

  it("operador não acessa financeiro", () => {
    const decision = authorizeStoreAccess(operatorA, { storeId: "store-a" }, "view_finance");
    expect(decision.ok).toBe(false);
  });

  it("cadastro Google não vira platform_admin", () => {
    expect(rejectRoleEscalation("owner", "platform_admin")).toBe(true);
  });
});
