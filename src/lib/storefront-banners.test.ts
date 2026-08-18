import { describe, expect, it } from "vitest";

import {
  bannerDisplayStatus,
  bannerHref,
  bannerIsPublic,
  clampFocus,
  isSafeHttpUrl,
  validateBannerInput,
} from "./storefront-banners";

const base = {
  internalName: "Combo",
  placement: "hero",
  targetType: "none",
  status: "active",
  desktopMediaId: "img-1",
};

describe("banners do cardápio", () => {
  it("bloqueia javascript: e aceita https", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("https://mipede-web.vercel.app/loja/hot-dog-da-casa")).toBe(true);
  });

  it("rascunho e pausado não aparecem publicamente", () => {
    expect(bannerIsPublic({ ...base, status: "draft" } as never, Date.now(), "desktop")).toBe(false);
    expect(bannerIsPublic({ ...base, status: "paused" } as never, Date.now(), "desktop")).toBe(false);
  });

  it("respeita agendamento antes, durante e depois", () => {
    const now = 1_000_000;
    expect(bannerIsPublic({ ...base, status: "active", startsAt: now + 10 } as never, now, "desktop")).toBe(false);
    expect(bannerIsPublic({ ...base, status: "active", startsAt: now - 10, endsAt: now + 10 } as never, now, "desktop")).toBe(true);
    expect(bannerIsPublic({ ...base, status: "active", endsAt: now - 1 } as never, now, "desktop")).toBe(false);
    expect(bannerDisplayStatus({ status: "active", startsAt: now + 10, endsAt: null, placement: "hero" }, now)).toBe("Agendado");
    expect(bannerDisplayStatus({ status: "active", startsAt: null, endsAt: now - 1, placement: "hero" }, now)).toBe("Encerrado");
  });

  it("categoria desativada vira Precisa de ajuste e some do público", () => {
    expect(
      bannerDisplayStatus({ status: "active", placement: "after_category", afterCategoryId: "c1", startsAt: null, endsAt: null }, Date.now(), false),
    ).toBe("Precisa de ajuste");
    expect(
      bannerIsPublic({ ...base, placement: "after_category", afterCategoryId: "c1", status: "active" } as never, Date.now(), "desktop", false),
    ).toBe(false);
  });

  it("exige categoria na posição depois de uma categoria", () => {
    expect(validateBannerInput({ ...base, placement: "after_category" })?.field).toBe("afterCategoryId");
  });

  it("monta destino interno apenas da mesma loja via slug", () => {
    expect(bannerHref({ targetType: "product", targetId: "p1", slug: "hot-dog-da-casa" })).toBe(
      "/loja/hot-dog-da-casa/produto/p1",
    );
    expect(bannerHref({ targetType: "external", externalUrl: "javascript:alert(1)", slug: "loja" })).toBeNull();
  });

  it("normaliza o foco da capa entre 0 e 1", () => {
    expect(clampFocus(1.4)).toBe(1);
    expect(clampFocus(-0.2)).toBe(0);
    expect(clampFocus(0.3)).toBe(0.3);
  });
});
