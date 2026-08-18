import { describe, expect, it } from "vitest";

import {
  approvalAlreadyDone,
  canCreatePublicOnboardingStore,
  findReusablePublicStore,
  reaisToCents,
  shouldReplaceNumericSlug,
  slugifyName,
  storeApprovalLabel,
  type ExistingOnboardingStore,
} from "./onboarding-store";

const draft: ExistingOnboardingStore = {
  id: "draft",
  organizationId: "org-draft",
  slug: "41630150",
  status: "DRAFT",
  archivedAt: null,
  createdVia: "public_onboarding",
};

const active: ExistingOnboardingStore = {
  id: "active",
  organizationId: "org-active",
  slug: "41150630",
  status: "ACTIVE",
  archivedAt: null,
  createdVia: "public_onboarding",
};

describe("onboarding store reuse", () => {
  it("reusa a loja pública já existente em vez de criar outra", () => {
    expect(findReusablePublicStore([active, draft])?.id).toBe("active");
    expect(canCreatePublicOnboardingStore([active])).toBe(false);
    expect(canCreatePublicOnboardingStore([])).toBe(true);
  });

  it("ignora rascunho arquivado", () => {
    expect(
      findReusablePublicStore([{ ...draft, archivedAt: Date.now() }, active])?.id,
    ).toBe("active");
  });

  it("não cria loja nova quando já existe onboarding do mesmo usuário", () => {
    expect(canCreatePublicOnboardingStore([draft])).toBe(false);
  });

  it("aprovação repetida é idempotente", () => {
    expect(approvalAlreadyDone("ACTIVE")).toBe(true);
    expect(approvalAlreadyDone("PENDING_REVIEW")).toBe(false);
  });

  it("gera slug estável a partir do nome e troca CEP numérico", () => {
    expect(slugifyName("Hot Dog da Casa")).toBe("hot-dog-da-casa");
    expect(shouldReplaceNumericSlug("41150630", "Hot Dog da Casa")).toBe(true);
    expect(shouldReplaceNumericSlug("hot-dog-da-casa", "Hot Dog da Casa")).toBe(false);
  });

  it("mostra um único estado amigável na topbar", () => {
    expect(storeApprovalLabel("ACTIVE")).toBe("Ativa");
    expect(storeApprovalLabel("PENDING_REVIEW")).toBe("Em análise");
    expect(storeApprovalLabel("DRAFT")).toBe("Rascunho");
  });

  it("converte dinheiro em centavos sem float", () => {
    expect(reaisToCents(19.9)).toBe(1990);
    expect(reaisToCents(0)).toBe(0);
  });
});
