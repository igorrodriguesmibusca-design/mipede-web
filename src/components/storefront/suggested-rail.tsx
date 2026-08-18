import Link from "next/link";

import { Price } from "@/components/storefront/price";
import { suggestedProducts } from "@/data/mock-products";
import { routes } from "@/lib/routes";

export function SuggestedRail({ title }: { title: string }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-brand">
        <span aria-hidden="true">🍴</span>
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {suggestedProducts.map((item) => (
          <Link
            key={item.id}
            href={routes.store.product(item.id)}
            className="w-40 shrink-0"
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="h-full w-full object-cover" />
              {item.discount ? (
                <span className="absolute top-2 right-2 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  -{item.discount}%
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold">{item.name}</p>
            <Price value={item.price} previous={item.previousPrice} className="mt-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
