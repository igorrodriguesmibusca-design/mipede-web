export const BANNER_PLACEMENTS = ["hero", "after_category", "footer"] as const;
export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number];

export const BANNER_STATUSES = ["draft", "active", "paused"] as const;
export type BannerStatus = (typeof BANNER_STATUSES)[number];

export const BANNER_TARGETS = ["none", "product", "category", "coupon", "external"] as const;
export type BannerTarget = (typeof BANNER_TARGETS)[number];

export const BANNER_DEVICES = ["both", "desktop", "mobile"] as const;
export type BannerDevice = (typeof BANNER_DEVICES)[number];

export type BannerRecord = {
  id: string;
  internalName: string;
  desktopMediaId?: string | null;
  mobileMediaId?: string | null;
  altText?: string | null;
  placement: BannerPlacement;
  afterCategoryId?: string | null;
  targetType: BannerTarget;
  targetId?: string | null;
  externalUrl?: string | null;
  ctaLabel?: string | null;
  deviceScope: BannerDevice;
  sortOrder: number;
  status: BannerStatus;
  startsAt?: number | null;
  endsAt?: number | null;
};

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function clampFocus(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 0.5;
  return Math.min(1, Math.max(0, number));
}

export function validateBannerInput(input: {
  internalName: string;
  placement: string;
  afterCategoryId?: string | null;
  targetType: string;
  targetId?: string | null;
  externalUrl?: string | null;
  status: string;
  startsAt?: number | null;
  endsAt?: number | null;
  desktopMediaId?: string | null;
  mobileMediaId?: string | null;
}): { field: string; message: string } | null {
  if (!input.internalName.trim()) return { field: "internalName", message: "Informe o nome interno do banner." };
  if (!BANNER_PLACEMENTS.includes(input.placement as BannerPlacement)) {
    return { field: "placement", message: "Escolha uma posição válida no cardápio." };
  }
  if (input.placement === "after_category" && !input.afterCategoryId) {
    return { field: "afterCategoryId", message: "Selecione a categoria depois da qual o banner aparece." };
  }
  if (!BANNER_TARGETS.includes(input.targetType as BannerTarget)) {
    return { field: "targetType", message: "Escolha um destino válido." };
  }
  if ((input.targetType === "product" || input.targetType === "category" || input.targetType === "coupon") && !input.targetId) {
    return { field: "targetId", message: "Selecione o destino do clique." };
  }
  if (input.targetType === "external") {
    if (!input.externalUrl?.trim()) return { field: "externalUrl", message: "Informe um link http ou https." };
    if (!isSafeHttpUrl(input.externalUrl)) return { field: "externalUrl", message: "Use apenas links http:// ou https://." };
  }
  if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
    return { field: "endsAt", message: "A data final precisa ser posterior à inicial." };
  }
  if (input.status === "active" && !input.desktopMediaId && !input.mobileMediaId) {
    return { field: "desktopMediaId", message: "Um banner ativo precisa de pelo menos uma imagem." };
  }
  return null;
}

export function bannerDisplayStatus(
  banner: Pick<BannerRecord, "status" | "startsAt" | "endsAt" | "placement" | "afterCategoryId">,
  now: number,
  categoryActive = true,
): "Rascunho" | "Agendado" | "Em exibição" | "Pausado" | "Encerrado" | "Precisa de ajuste" {
  if (banner.placement === "after_category" && !categoryActive) return "Precisa de ajuste";
  if (banner.status === "draft") return "Rascunho";
  if (banner.status === "paused") return "Pausado";
  if (banner.startsAt && banner.startsAt > now) return "Agendado";
  if (banner.endsAt && banner.endsAt < now) return "Encerrado";
  return "Em exibição";
}

export function bannerIsPublic(
  banner: Pick<BannerRecord, "status" | "startsAt" | "endsAt" | "deviceScope" | "desktopMediaId" | "mobileMediaId" | "placement" | "afterCategoryId">,
  now: number,
  device: "desktop" | "mobile",
  categoryActive = true,
): boolean {
  if (banner.status !== "active") return false;
  if (banner.startsAt && banner.startsAt > now) return false;
  if (banner.endsAt && banner.endsAt < now) return false;
  if (banner.deviceScope && banner.deviceScope !== "both" && banner.deviceScope !== device) return false;
  if (!banner.desktopMediaId && !banner.mobileMediaId) return false;
  if (banner.placement === "after_category" && !categoryActive) return false;
  return true;
}

export function bannerHref(input: {
  targetType: BannerTarget;
  targetId?: string | null;
  externalUrl?: string | null;
  slug: string;
}): string | null {
  if (input.targetType === "none") return null;
  if (input.targetType === "external") return input.externalUrl && isSafeHttpUrl(input.externalUrl) ? input.externalUrl : null;
  if (input.targetType === "product" && input.targetId) return `/loja/${input.slug}/produto/${input.targetId}`;
  if (input.targetType === "category" && input.targetId) return `/loja/${input.slug}#categoria-${input.targetId}`;
  if (input.targetType === "coupon") return `/loja/${input.slug}`;
  return null;
}

export const STOREFRONT_TIMEZONE = "America/Bahia";
