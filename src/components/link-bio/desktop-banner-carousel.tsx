"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { bioBanners } from "@/data/mock-analytics";
import { formatCurrency } from "@/lib/utils";

export function DesktopBannerCarousel() {
  const [index, setIndex] = useState(0);
  const banner = bioBanners[index];

  function go(delta: number) {
    setIndex((current) => (current + delta + bioBanners.length) % bioBanners.length);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-zinc-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.image} alt="" className="h-[360px] w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/35 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
        <p className="mb-2 text-xs font-semibold tracking-wide uppercase">Promoção em destaque</p>
        <h2 className="text-3xl font-semibold">{banner.title}</h2>
        <p className="mt-2 max-w-md text-sm text-white/80">{banner.description}</p>
        <p className="mt-3 text-2xl font-semibold">{formatCurrency(banner.price)}</p>
        <Link
          href={banner.href}
          className="mt-5 inline-flex h-11 w-fit items-center rounded-xl bg-brand px-5 text-sm font-semibold"
        >
          Eu quero
        </Link>
      </div>
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Banner anterior"
        className="absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Próximo banner"
        className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink"
      >
        <ChevronRight className="size-5" />
      </button>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {bioBanners.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Ir para ${item.title}`}
            onClick={() => setIndex(itemIndex)}
            className={
              itemIndex === index ? "h-2 w-6 rounded-full bg-white" : "size-2 rounded-full bg-white/50"
            }
          />
        ))}
      </div>
    </section>
  );
}
