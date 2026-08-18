import { describe, expect, it } from "vitest";

import {
  isReservedSlug,
  isValidSlug,
  rejectMassAssignment,
  resolveAuthorizedStore,
  stripForbiddenFields,
  type AuthContext,
} from "./roles";

const ownerA: AuthContext = {
  userId: "user-a-owner",
  email: "dona@loja-a.test",
  emailVerified: true,
  platformRole: null,
  memberships: [
    {
      organizationId: "org-a",
      storeId: "store-a",
      storeSlug: "loja-a",
      storeStatus: "ACTIVE",
      role: "owner",
    },
  ],
};

const ownerB: AuthContext = {
  userId: "user-b-owner",
  email: "dono@loja-b.test",
  emailVerified: true,
  platformRole: null,
  memberships: [
    {
      organizationId: "org-b",
      storeId: "store-b",
      storeSlug: "loja-b",
      storeStatus: "ACTIVE",
      role: "owner",
    },
  ],
};

describe("slugs", () => {
  it("bloqueia slugs reservados", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("gestor")).toBe(true);
    expect(isReservedSlug("plataforma")).toBe(true);
    expect(isValidSlug("admin")).toBe(false);
    expect(isValidSlug("loja-a")).toBe(true);
  });
});

describe("isolamento entre lojas", () => {
  it("Loja A não resolve a Loja B por storeId", () => {
    expect(resolveAuthorizedStore(ownerA, { storeId: "store-b" })).toBeNull();
  });

  it("Loja A não resolve a Loja B por organizationId", () => {
    expect(resolveAuthorizedStore(ownerA, { organizationId: "org-b" })).toBeNull();
  });

  it("Loja A não resolve a Loja B por slug", () => {
    expect(resolveAuthorizedStore(ownerA, { slug: "loja-b" })).toBeNull();
  });

  it("Loja B não resolve a Loja A", () => {
    expect(resolveAuthorizedStore(ownerB, { storeId: "store-a", slug: "loja-a" })).toBeNull();
  });

  it("resolve somente o estabelecimento autorizado", () => {
    expect(resolveAuthorizedStore(ownerA, { storeId: "store-a" })?.storeSlug).toBe("loja-a");
  });
});

describe("mass assignment", () => {
  it("rejeita papéis e status enviados pelo cliente", () => {
    const rejected = rejectMassAssignment(
      {
        name: "Loja",
        role: "platform_admin",
        isPlatformAdmin: true,
        status: "ACTIVE",
        approvedBy: "me",
      },
      ["name"],
    );
    expect(rejected).toEqual(expect.arrayContaining(["role", "isPlatformAdmin", "status", "approvedBy"]));
  });

  it("remove campos proibidos", () => {
    const clean = stripForbiddenFields(
      { name: "Loja", role: "owner", organizationId: "org-x" },
      ["name", "role", "organizationId"],
    );
    expect(clean).toEqual({ name: "Loja" });
  });
});
