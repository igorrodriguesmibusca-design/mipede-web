import { notFound } from "next/navigation";

import { PageHeader } from "@/components/storefront/page-header";
import { Price } from "@/components/storefront/price";
import { PrimaryCta } from "@/components/storefront/primary-cta";
import { StoreHeader } from "@/components/storefront/store-header";
import { addonGroups, getProduct } from "@/data/mock-products";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  const groups = addonGroups.filter((group) =>
    ["molhos", "bordas"].includes(group.id),
  );

  return (
    <div className="pb-28">
      <div className="hidden md:block">
        <StoreHeader compact />
      </div>
      <PageHeader title="Adicionais" href={routes.store.home} />

      <article className="mx-auto max-w-3xl px-4 py-4">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-100 md:flex md:gap-6 md:bg-transparent">
          <div className="relative aspect-16/10 md:aspect-square md:w-56 md:shrink-0 md:overflow-hidden md:rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt="" className="h-full w-full object-cover" />
            {product.discount ? (
              <span className="absolute top-3 right-3 rounded-md bg-brand px-2 py-1 text-xs font-semibold text-white">
                -{product.discount}%
              </span>
            ) : null}
          </div>
          <div className="pt-4 md:pt-0">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <p className="mt-1 text-sm text-subtle">{product.description}</p>
            <Price
              value={product.price}
              previous={product.previousPrice}
              className="mt-3 text-base"
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {groups.map((group) => (
            <section key={group.id}>
              <div className="rounded-xl bg-zinc-100 px-4 py-3">
                <h2 className="font-semibold">{group.name}</h2>
                <p className="text-xs text-subtle">
                  {group.max === 1
                    ? "Escolha 1 opção"
                    : `Escolha até ${group.max} opções`}
                </p>
              </div>
              <ul>
                {group.options.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-center justify-between border-b border-zinc-100 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{option.name}</p>
                      {option.price > 0 ? (
                        <p className="text-sm font-semibold text-brand">
                          {formatCurrency(option.price)}
                        </p>
                      ) : null}
                    </div>
                    {group.max > 1 ? (
                      <span className="text-xl font-light text-brand">+</span>
                    ) : (
                      <span className="size-4 rounded-full border border-zinc-300" />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <div className="rounded-t-xl bg-zinc-100 px-4 py-3 font-semibold">
              Observações
            </div>
            <textarea
              readOnly
              placeholder="Ex: Retirar cebola"
              className="h-24 w-full rounded-b-xl border border-zinc-200 px-4 py-3 text-sm outline-none"
            />
          </section>
        </div>
      </article>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-white p-4 md:static md:mx-auto md:max-w-3xl">
        <PrimaryCta
          href={routes.store.cart}
          label="Avançar"
          value={formatCurrency(37.99)}
        />
      </div>
    </div>
  );
}
