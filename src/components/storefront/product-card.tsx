import Link from "next/link";

import { Price } from "@/components/storefront/price";
import type { Product } from "@/data/mock-products";
import { routes } from "@/lib/routes";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <Link href={routes.store.product(product.id)} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt="" className="h-full w-full object-cover" />
          {product.discount ? (
            <span className="absolute top-2 right-2 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
              -{product.discount}%
            </span>
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-ink">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-subtle">{product.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Price value={product.price} previous={product.previousPrice} />
            <span className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white">
              Adicionar
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
