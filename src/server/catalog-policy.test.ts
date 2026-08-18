import { describe, expect, it } from "vitest";

import {
  assertSameStore,
  canWriteCatalog,
  canWriteCoupons,
  ignoreClientStoreId,
  isAllowedImageMime,
  isAllowedTrackingDestination,
  normalizeCouponCode,
  sniffImageMime,
} from "./catalog-policy";

describe("catalog tenant policy", () => {
  it("operator não escreve catálogo nem cupom", () => {
    expect(canWriteCatalog("operator")).toBe(false);
    expect(canWriteCoupons("operator")).toBe(false);
    expect(canWriteCatalog("owner")).toBe(true);
  });

  it("ignora store_id forjado no body", () => {
    const clean = ignoreClientStoreId({ name: "Hot Dogs", store_id: "loja-b", storeId: "loja-b" });
    expect(clean.store_id).toBeUndefined();
    expect(clean.storeId).toBeUndefined();
    expect(clean.name).toBe("Hot Dogs");
  });

  it("impede vínculo cruzado entre lojas", () => {
    expect(assertSameStore("store-a", "store-b")).toBe(false);
    expect(assertSameStore("store-a", "store-a")).toBe(true);
  });

  it("normaliza cupom e bloqueia open redirect", () => {
    expect(normalizeCouponCode("  natal 10 ")).toBe("NATAL10");
    expect(isAllowedTrackingDestination("/loja/hot-dog-da-casa", "hot-dog-da-casa")).toBe(true);
    expect(isAllowedTrackingDestination("https://evil.test", "hot-dog-da-casa")).toBe(false);
    expect(isAllowedTrackingDestination("//evil.test", "hot-dog-da-casa")).toBe(false);
    expect(isAllowedTrackingDestination("/loja/outra-loja", "hot-dog-da-casa")).toBe(false);
  });

  it("rejeita upload que não é imagem real", () => {
    expect(isAllowedImageMime("application/pdf")).toBe(false);
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageMime(new Uint8Array([0x00, 0x01]))).toBeNull();
  });
});
