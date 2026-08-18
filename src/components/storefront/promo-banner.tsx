import Link from "next/link";

import { promo } from "@/data/mock-products";
import { formatCurrency } from "@/lib/utils";

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-zinc-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={promo.image} alt="" className="h-44 w-full object-cover md:h-52" />
      <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-5 text-white md:p-8">
        <span className="mb-2 inline-flex w-fit rounded-md bg-brand px-2 py-0.5 text-xs font-bold">
          {promo.title}
        </span>
        <h2 className="text-xl font-bold md:text-2xl">{promo.productName}</h2>
        <p className="mt-1 max-w-xs text-xs text-white/80 md:text-sm">{promo.description}</p>
        <p className="mt-2 text-sm font-medium">
          POR <span className="text-lg font-bold">{formatCurrency(promo.price)}</span>
        </p>
      </div>
      <Link
        href={promo.href}
        className="absolute right-4 bottom-4 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white md:right-6 md:bottom-6"
      >
        EU QUERO!
      </Link>
    </section>
  );
}
