"use client";

import { useEffect, useState } from "react";

import { PublicBannerSlot } from "@/components/storefront/public-banner-slot";
import { cn } from "@/lib/utils";

type PreviewBanner = {
  id: string;
  placement: "hero" | "after_category" | "footer";
  afterCategoryId?: string | null;
  desktopUrl?: string | null;
  mobileUrl?: string | null;
  alt?: string;
  href?: string | null;
  ctaLabel?: string | null;
};

export function StorefrontPreview({
  storeName,
  isOpen,
  identity,
  banners,
}: {
  storeName: string;
  isOpen: boolean;
  identity: {
    logoUrl?: string | null;
    coverDesktopUrl?: string | null;
    coverMobileUrl?: string | null;
    coverDesktopFocusX?: number;
    coverDesktopFocusY?: number;
    coverMobileFocusX?: number;
    coverMobileFocusY?: number;
  };
  banners?: PreviewBanner[];
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [loadedBanners, setLoadedBanners] = useState<PreviewBanner[]>(banners ?? []);

  useEffect(() => {
    if (banners) return;
    void fetch("/api/mipede/v1/catalog/banners", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { banners: [] }))
      .then((payload: { banners?: PreviewBanner[] }) => setLoadedBanners(payload.banners ?? []));
  }, [banners]);

  const cover = device === "mobile" ? identity.coverMobileUrl || identity.coverDesktopUrl : identity.coverDesktopUrl || identity.coverMobileUrl;
  const focus =
    device === "mobile"
      ? { x: identity.coverMobileFocusX ?? identity.coverDesktopFocusX ?? 0.5, y: identity.coverMobileFocusY ?? identity.coverDesktopFocusY ?? 0.5 }
      : { x: identity.coverDesktopFocusX ?? 0.5, y: identity.coverDesktopFocusY ?? 0.5 };
  const list = loadedBanners;

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button type="button" className={cn("rounded-xl px-3 py-1.5 text-sm", device === "desktop" ? "bg-brand text-white" : "border border-zinc-200")} onClick={() => setDevice("desktop")}>
          Desktop
        </button>
        <button type="button" className={cn("rounded-xl px-3 py-1.5 text-sm", device === "mobile" ? "bg-brand text-white" : "border border-zinc-200")} onClick={() => setDevice("mobile")}>
          Mobile
        </button>
      </div>
      <div className={cn("overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50", device === "mobile" ? "mx-auto max-w-sm" : "w-full")}>
        <div className="relative h-28 overflow-hidden bg-linear-to-r from-orange-600 to-brand">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }} />
          ) : null}
        </div>
        <div className="flex items-center gap-3 bg-white p-3">
          <span className="size-10 overflow-hidden rounded-xl bg-brand">
            {identity.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={identity.logoUrl} alt={storeName} className="h-full w-full object-cover" />
            ) : null}
          </span>
          <div>
            <p className="font-semibold">{storeName || "Sua loja"}</p>
            <p className="text-xs text-subtle">{isOpen ? "Aberto" : "Fechado"}</p>
          </div>
        </div>
        <div className="space-y-3 p-3">
          <p className="text-xs font-medium text-subtle">Capa e informações da loja</p>
          <PublicBannerSlot banners={list.filter((item) => item.placement === "hero")} device={device} />
          <p className="text-xs font-medium text-subtle">Categorias e produtos</p>
          {list.filter((item) => item.placement === "after_category").map((banner) => (
            <PublicBannerSlot key={banner.id} banners={[banner]} device={device} />
          ))}
          <PublicBannerSlot banners={list.filter((item) => item.placement === "footer")} device={device} />
        </div>
      </div>
    </div>
  );
}
