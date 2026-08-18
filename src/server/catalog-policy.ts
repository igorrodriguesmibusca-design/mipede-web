import type { StoreRole } from "./roles";

export function canWriteCatalog(role: StoreRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canWriteSettings(role: StoreRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canWriteCoupons(role: StoreRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canViewOrders(role: StoreRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "operator";
}

export function ignoreClientStoreId(body: Record<string, unknown>): Record<string, unknown> {
  const next = { ...body };
  delete next.store_id;
  delete next.storeId;
  delete next.organizationId;
  delete next.organization_id;
  return next;
}

export function assertSameStore(left: string, right: string): boolean {
  return left === right && left.length > 0;
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function isAllowedTrackingDestination(destination: string, slug: string): boolean {
  if (!destination.startsWith("/")) return false;
  if (destination.startsWith("//")) return false;
  if (destination.includes("://")) return false;
  return destination === `/loja/${slug}` || destination.startsWith(`/loja/${slug}/`);
}

export function isAllowedImageMime(mime: string): boolean {
  return mime === "image/jpeg" || mime === "image/png" || mime === "image/webp";
}

export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}
