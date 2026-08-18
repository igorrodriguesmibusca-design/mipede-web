import { describe, expect, it } from "vitest";

import { loginSchema, onboardingCompanySchema, registerSchema } from "./schemas";

describe("validação de cadastro", () => {
  it("recusa senha curta ou comum", () => {
    const parsed = registerSchema.safeParse({
      name: "Ana Silva",
      email: "ana@loja.test",
      whatsapp: "11999999999",
      password: "password123",
      confirmPassword: "password123",
      acceptTerms: true,
      acceptPrivacy: true,
      turnstileToken: "token",
    });
    expect(parsed.success).toBe(false);
  });

  it("aceita cadastro válido", () => {
    const parsed = registerSchema.safeParse({
      name: "Ana Silva",
      email: "ana@loja.test",
      whatsapp: "11999999999",
      password: "Laranja-2026!",
      confirmPassword: "Laranja-2026!",
      acceptTerms: true,
      acceptPrivacy: true,
      turnstileToken: "token",
    });
    expect(parsed.success).toBe(true);
  });

  it("exige login com e-mail", () => {
    expect(loginSchema.safeParse({ email: "x", password: "a" }).success).toBe(false);
  });

  it("recusa slug reservado no onboarding", () => {
    const parsed = onboardingCompanySchema.safeParse({
      name: "Loja",
      segment: "Pizza",
      whatsapp: "11999999999",
      responsible: "Ana Silva",
      city: "São Paulo",
      state: "SP",
      slug: "admin",
    });
    expect(parsed.success).toBe(false);
  });
});
