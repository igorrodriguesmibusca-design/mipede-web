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

export const categoryWriteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  categoryId: z.string().min(8).max(80),
  priceCents: z.number().int().min(0).max(10_000_000),
  promoPriceCents: z.number().int().min(0).max(10_000_000).optional().nullable(),
  imageKey: z.string().trim().max(200).optional().nullable(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  complementGroupIds: z.array(z.string().min(8).max(80)).max(20).optional(),
});

export const complementGroupWriteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  required: z.boolean().optional(),
  minSelect: z.number().int().min(0).max(50).optional(),
  maxSelect: z.number().int().min(0).max(50).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  productIds: z.array(z.string().min(8).max(80)).max(100).optional(),
});

export const complementOptionWriteSchema = z.object({
  name: z.string().trim().min(1).max(80),
  priceCents: z.number().int().min(0).max(10_000_000).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const couponWriteSchema = z.object({
  code: z.string().trim().min(3).max(24),
  name: z.string().trim().min(2).max(80),
  type: z.enum(["percent", "fixed", "free_delivery"]),
  value: z.number().int().min(0).max(10_000_000),
  minOrderCents: z.number().int().min(0).max(10_000_000).optional(),
  maxDiscountCents: z.number().int().min(0).max(10_000_000).optional().nullable(),
  startsAt: z.number().int().optional().nullable(),
  endsAt: z.number().int().optional().nullable(),
  usageLimit: z.number().int().min(1).max(1_000_000).optional().nullable(),
  perCustomerLimit: z.number().int().min(1).max(100).optional().nullable(),
  newCustomersOnly: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const storeSettingsWriteSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(240).optional().nullable(),
  whatsapp: z.string().trim().min(10).max(20).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  minOrderCents: z.number().int().min(0).max(10_000_000).optional(),
  hoursLabel: z.string().trim().max(80).optional().nullable(),
  isOpen: z.boolean().optional(),
  addressLine: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().max(2).optional().nullable(),
  logoKey: z.string().trim().max(200).optional().nullable(),
  coverKey: z.string().trim().max(200).optional().nullable(),
});

export const deliverySettingsWriteSchema = z.object({
  deliveryOwn: z.boolean().optional(),
  pickup: z.boolean().optional(),
  dineIn: z.boolean().optional(),
  deliveryFeeCents: z.number().int().min(0).max(10_000_000).optional(),
  etaMinutes: z.number().int().min(5).max(180).optional().nullable(),
  minOrderCents: z.number().int().min(0).max(10_000_000).optional(),
  freeDeliveryCents: z.number().int().min(0).max(10_000_000).optional().nullable(),
  deliveryArea: z.string().trim().max(400).optional().nullable(),
  payCash: z.boolean().optional(),
  payPix: z.boolean().optional(),
  payDebit: z.boolean().optional(),
  payCredit: z.boolean().optional(),
  changeNeeded: z.boolean().optional(),
});

export const identityWriteSchema = z.object({
  logoMediaId: z.string().min(8).max(80).nullable().optional(),
  coverDesktopMediaId: z.string().min(8).max(80).nullable().optional(),
  coverMobileMediaId: z.string().min(8).max(80).nullable().optional(),
  coverDesktopFocusX: z.number().min(0).max(1).optional(),
  coverDesktopFocusY: z.number().min(0).max(1).optional(),
  coverMobileFocusX: z.number().min(0).max(1).optional(),
  coverMobileFocusY: z.number().min(0).max(1).optional(),
});

export const bannerWriteSchema = z.object({
  internalName: z.string().trim().min(2).max(80),
  desktopMediaId: z.string().min(8).max(80).nullable().optional(),
  mobileMediaId: z.string().min(8).max(80).nullable().optional(),
  altText: z.string().trim().max(160).optional().nullable(),
  placement: z.enum(["hero", "after_category", "footer"]),
  afterCategoryId: z.string().min(8).max(80).nullable().optional(),
  targetType: z.enum(["none", "product", "category", "coupon", "external"]),
  targetId: z.string().min(8).max(80).nullable().optional(),
  externalUrl: z.string().trim().max(400).nullable().optional(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
  deviceScope: z.enum(["both", "desktop", "mobile"]).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  status: z.enum(["draft", "active", "paused"]),
  startsAt: z.number().int().nullable().optional(),
  endsAt: z.number().int().nullable().optional(),
});

export const trackingLinkWriteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  origin: z.enum(["instagram", "meta_ads", "google_ads", "whatsapp", "custom"]),
  medium: z.string().trim().max(40).optional(),
  campaign: z.string().trim().max(80).optional(),
  content: z.string().trim().max(80).optional(),
  destination: z.string().trim().min(1).max(160),
});
