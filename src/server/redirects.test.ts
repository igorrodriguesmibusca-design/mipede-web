import { describe, expect, it } from "vitest";

import { isSafeInternalPath, resolvePostAuthDestination } from "./redirects";

describe("open redirect", () => {
  it("bloqueia destinos externos", () => {
    expect(isSafeInternalPath("https://evil.test")).toBe(false);
    expect(isSafeInternalPath("//evil.test")).toBe(false);
    expect(isSafeInternalPath("/\\evil.test")).toBe(false);
    expect(isSafeInternalPath("https://mipede-web.vercel.app/admin")).toBe(false);
  });

  it("aceita somente caminhos internos autorizados", () => {
    expect(isSafeInternalPath("/admin/desempenho")).toBe(true);
    expect(isSafeInternalPath("/onboarding/empresa")).toBe(true);
    expect(isSafeInternalPath("/loja/pizzaria-imperial")).toBe(false);
  });
});

describe("destino pós-login", () => {
  it("primeiro acesso vai ao onboarding", () => {
    expect(resolvePostAuthDestination({ platformAdmin: false, store: null })).toBe("/onboarding/empresa");
  });

  it("usuário existente vai ao painel", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: false,
        store: { slug: "loja-a", role: "owner", status: "PENDING_REVIEW", onboardingStatus: "submitted" },
      }),
    ).toBe("/admin/desempenho");
  });

  it("operador vai ao gestor da própria loja", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: false,
        store: { slug: "loja-a", role: "operator", status: "ACTIVE", onboardingStatus: "submitted" },
      }),
    ).toBe("/gestor/loja-a");
  });

  it("platform admin vai à plataforma", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: true,
        store: null,
        requested: "/plataforma/estabelecimentos",
      }),
    ).toBe("/plataforma/estabelecimentos");
  });

  it("e-mail fora da allowlist não usa redirect de plataforma", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: false,
        store: { slug: "loja-a", role: "owner", status: "ACTIVE", onboardingStatus: "submitted" },
        requested: "/plataforma/estabelecimentos",
      }),
    ).toBe("/admin/desempenho");
  });

  it("ignora query de papel e open redirect", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: false,
        store: { slug: "loja-a", role: "admin", status: "ACTIVE", onboardingStatus: "submitted" },
        requested: "https://evil.test/?role=platform_admin",
      }),
    ).toBe("/admin/desempenho");
  });

  it("loja A não é redirecionada para o gestor da loja B", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: false,
        store: { slug: "loja-a", role: "operator", status: "ACTIVE", onboardingStatus: "submitted" },
        requested: "/gestor/loja-b",
      }),
    ).toBe("/gestor/loja-a");
  });

  it("retoma onboarding incompleto", () => {
    expect(
      resolvePostAuthDestination({
        platformAdmin: false,
        store: { slug: "loja-a", role: "owner", status: "DRAFT", onboardingStatus: "operation" },
      }),
    ).toBe("/onboarding/identidade");
  });
});
