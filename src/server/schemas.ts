import { z } from "zod";

import { isCommonPassword } from "./passwords";
import { isValidSlug } from "./roles";

export const passwordSchema = z
  .string()
  .min(10, "A senha deve ter no mínimo 10 caracteres")
  .max(128, "A senha é longa demais")
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: "Use letras e números",
  })
  .refine((value) => !isCommonPassword(value), {
    message: "Esta senha é muito comum",
  });

export const registerSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email(),
    whatsapp: z.string().trim().min(10).max(20),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true),
    acceptPrivacy: z.literal(true),
    turnstileToken: z.string().min(1),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  turnstileToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  turnstileToken: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const onboardingCompanySchema = z.object({
  name: z.string().trim().min(2).max(80),
  segment: z.string().trim().min(2).max(60),
  whatsapp: z.string().trim().min(10).max(20),
  responsible: z.string().trim().min(3).max(120),
  cnpj: z.string().trim().max(20).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().length(2),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(48)
    .refine((value) => isValidSlug(value), "Slug reservado ou inválido"),
});

export const onboardingOperationSchema = z.object({
  deliveryOwn: z.boolean(),
  pickup: z.boolean(),
  dineIn: z.boolean(),
  hoursLabel: z.string().trim().min(3).max(80),
  prepMinutes: z.number().int().min(5).max(180),
  minOrder: z.number().min(0).max(9999),
  payments: z.array(z.enum(["DINHEIRO", "PIX", "CARTAO"])).min(1),
  deliveryArea: z.string().trim().max(200).optional(),
});

export const onboardingIdentitySchema = z.object({
  description: z.string().trim().max(240).optional(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/),
});

export const platformDecisionSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "reactivate"]),
  reason: z.string().trim().max(300).optional(),
});
