"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type PublicBanner = {
  id: string;
  placement?: string;
  afterCategoryId?: string | null;
  desktopUrl?: string | null;
  mobileUrl?: string | null;
  alt?: string;
  href?: string | null;
  ctaLabel?: string | null;
};

export function PublicBannerSlot({
  banners,
  device,
}: {
  banners: PublicBanner[];
  device: "desktop" | "mobile";
}) {
  const [index, setIndex] = useState(0);
  const visible = banners.filter((banner) => (device === "mobile" ? banner.mobileUrl || banner.desktopUrl : banner.desktopUrl || banner.mobileUrl));
  const current = visible[index];

  useEffect(() => {
    if (visible.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % visible.length), 6000);
    return () => window.clearInterval(timer);
  }, [visible.length]);

  if (!current) return null;
  const src = device === "mobile" ? current.mobileUrl || current.desktopUrl : current.desktopUrl || current.mobileUrl;
  if (!src) return null;

  const image = (
    <div className="relative overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={current.alt || "Banner promocional"} className="h-36 w-full object-cover md:h-44" />
      {current.ctaLabel ? (
        <span className="absolute right-3 bottom-3 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">{current.ctaLabel}</span>
      ) : null}
    </div>
  );

  return (
    <section className="relative">
      {current.href ? (
        <Link href={current.href} target={current.href.startsWith("http") ? "_blank" : undefined} rel={current.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block">
          {image}
        </Link>
      ) : (
        image
      )}
      {visible.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button type="button" aria-label="Banner anterior" className="rounded-full border border-zinc-200 p-1" onClick={() => setIndex((value) => (value - 1 + visible.length) % visible.length)}>
            <ChevronLeft className="size-4" />
          </button>
          {visible.map((banner, itemIndex) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Ir para banner ${itemIndex + 1}`}
              className={cn("size-2 rounded-full", itemIndex === index ? "bg-brand" : "bg-zinc-300")}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
          <button type="button" aria-label="Próximo banner" className="rounded-full border border-zinc-200 p-1" onClick={() => setIndex((value) => (value + 1) % visible.length)}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
