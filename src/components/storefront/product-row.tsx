import Link from "next/link";

import { Price } from "@/components/storefront/price";
import type { Product } from "@/data/mock-products";
import { routes } from "@/lib/routes";

export function ProductRow({ product }: { product: Product }) {
  return (
    <Link
      href={routes.store.product(product.id)}
      className="flex gap-3 border-b border-zinc-100 py-3 last:border-0"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt="" className="h-full w-full object-cover" />
        {product.discount ? (
          <span className="absolute top-1 right-1 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
            -{product.discount}%
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-ink">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-subtle">{product.description}</p>
        <Price value={product.price} previous={product.previousPrice} className="mt-1.5" />
      </div>
    </Link>
  );
}
