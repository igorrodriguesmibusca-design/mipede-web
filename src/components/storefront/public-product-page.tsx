"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/storefront/page-header";
import { Price } from "@/components/storefront/price";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";
import { Toast } from "@/components/ui/toast";
import { complementRuleSummary, lineTotalCents, nextSelection, unitPriceCents } from "@/lib/complement-rules";
import { addCartItem, otherStoreCartSlug, clearCart } from "@/lib/store-cart";
import { storefrontPath } from "@/lib/routes";
import { cn, formatCurrency } from "@/lib/utils";

type PublicOption = { id: string; name: string; priceCents: number };
type PublicGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: PublicOption[];
};
type PublicProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  promoPriceCents?: number | null;
  imageUrl?: string | null;
  complements: PublicGroup[];
};

export function PublicProductPage({ slug, productId }: { slug: string; productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmStore, setConfirmStore] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/mipede/v1/public/menu/${slug}/products/${productId}`)
      .then((response) => {
        if (response.status === 404) {
          setStatus("missing");
          return null;
        }
        if (!response.ok) {
          setStatus("error");
          return null;
        }
        return response.json();
      })
      .then((payload: { product?: PublicProduct } | null) => {
        if (!payload?.product) return;
        setProduct(payload.product);
        setStatus("ready");
      });
  }, [slug, productId]);

  const basePrice = product?.promoPriceCents ?? product?.priceCents ?? 0;
  const selectedComplements = useMemo(() => {
    if (!product) return [];
    return product.complements.flatMap((group) =>
      (selected[group.id] ?? [])
        .map((optionId) => group.options.find((option) => option.id === optionId))
        .filter((option): option is PublicOption => Boolean(option))
        .map((option) => ({ groupId: group.id, optionId: option.id, name: option.name, priceCents: option.priceCents })),
    );
  }, [product, selected]);

  const unit = unitPriceCents(
    basePrice,
    selectedComplements.map((item) => item.priceCents),
  );
  const total = lineTotalCents(unit, quantity);

  function firstIncompleteGroup() {
    if (!product) return null;
    return (
      product.complements.find((group) => (selected[group.id] ?? []).length < group.minSelect) ?? null
    );
  }

  function addToCart() {
    if (!product) return;
    const incomplete = firstIncompleteGroup();
    if (incomplete) {
      setGroupError(incomplete.id);
      document.getElementById(`group-${incomplete.id}`)?.focus();
      return;
    }
    const other = otherStoreCartSlug(slug);
    if (other) {
      setConfirmStore(other);
      return;
    }
    persist();
  }

  function persist() {
    if (!product) return;
    addCartItem(slug, {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl ?? null,
      basePriceCents: basePrice,
      complements: selectedComplements,
      quantity,
      note: note.trim(),
    });
    setConfirmStore(null);
    setToast("Item adicionado ao carrinho.");
    window.setTimeout(() => router.push(`${storefrontPath(slug)}/carrinho`), 600);
  }

  if (status === "loading") {
    return <div className="px-4 py-16 text-center text-sm text-subtle">Carregando detalhes do produto...</div>;
  }
  if (status === "error") {
    return <div className="px-4 py-16 text-center text-sm text-subtle">Não foi possível carregar este produto.</div>;
  }
  if (status === "missing" || !product) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Produto indisponível</h1>
        <p className="mt-2 text-sm text-subtle">Este item não está disponível neste cardápio.</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader title="Adicionais" href={storefrontPath(slug)} />
      <article className="mx-auto max-w-3xl px-4 py-4">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-100 md:flex md:gap-6 md:bg-transparent">
          <div className="relative aspect-16/10 bg-zinc-200 md:aspect-square md:w-56 md:shrink-0 md:overflow-hidden md:rounded-2xl">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="pt-4 md:pt-0">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            {product.description ? <p className="mt-1 text-sm text-subtle">{product.description}</p> : null}
            <Price value={basePrice / 100} previous={product.promoPriceCents ? product.priceCents / 100 : undefined} className="mt-3 text-base" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {product.complements.map((group) => {
            const chosen = selected[group.id] ?? [];
            const atMax = chosen.length >= group.maxSelect;
            const invalid = groupError === group.id;
            return (
              <section
                key={group.id}
                id={`group-${group.id}`}
                tabIndex={-1}
                className={cn(invalid && "rounded-2xl ring-2 ring-red-400")}
              >
                <div className="rounded-xl bg-zinc-100 px-4 py-3">
                  <h2 className="font-semibold">{group.name}</h2>
                  <p className="text-xs text-subtle">{complementRuleSummary(group.required, group.minSelect, group.maxSelect)}</p>
                  <p className="mt-1 text-xs font-medium">
                    {chosen.length} de {group.maxSelect}
                  </p>
                </div>
                {group.options.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-subtle">Este grupo ainda não possui opções ativas.</p>
                ) : (
                  <ul>
                    {group.options.map((option) => {
                      const checked = chosen.includes(option.id);
                      const disabled = !checked && atMax && group.maxSelect > 1;
                      return (
                        <li key={option.id} className="border-b border-zinc-100">
                          <label className={cn("flex cursor-pointer items-center justify-between py-3", disabled && "cursor-not-allowed opacity-50")}>
                            <span>
                              <span className="block text-sm font-medium">{option.name}</span>
                              {option.priceCents > 0 ? (
                                <span className="text-sm font-semibold text-brand">+ {formatCurrency(option.priceCents / 100)}</span>
                              ) : null}
                            </span>
                            <input
                              type={group.maxSelect === 1 ? "radio" : "checkbox"}
                              name={`group-${group.id}`}
                              checked={checked}
                              disabled={disabled}
                              onChange={() => {
                                setGroupError(null);
                                setSelected((current) => ({
                                  ...current,
                                  [group.id]: nextSelection(current[group.id] ?? [], option.id, group.maxSelect),
                                }));
                              }}
                            />
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {atMax && group.maxSelect > 1 ? (
                  <p className="pt-2 text-xs text-amber-700">Você já selecionou o máximo de {group.maxSelect} opções.</p>
                ) : null}
                {invalid ? <p className="pt-2 text-sm text-red-600">Selecione no mínimo {group.minSelect} opção(ões) neste grupo.</p> : null}
              </section>
            );
          })}

          <section>
            <div className="rounded-t-xl bg-zinc-100 px-4 py-3 font-semibold">Observações</div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex: Retirar cebola"
              className="h-24 w-full rounded-b-xl border border-zinc-200 px-4 py-3 text-sm outline-none"
            />
          </section>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quantidade</span>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>
        </div>
      </article>

      {confirmStore ? (
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <p>Há itens de outro estabelecimento no navegador. Limpar o carrinho anterior para continuar?</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded-xl bg-brand px-3 py-2 font-semibold text-white" onClick={() => { clearCart(confirmStore); persist(); }}>
                Limpar e adicionar
              </button>
              <button type="button" className="rounded-xl border border-zinc-200 px-3 py-2" onClick={() => setConfirmStore(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 bg-white p-4 md:static md:mx-auto md:max-w-3xl">
        <button
          type="button"
          onClick={addToCart}
          className="flex h-12 w-full items-center justify-between rounded-2xl bg-brand px-4 text-sm font-semibold text-white"
        >
          <span>Adicionar ao carrinho</span>
          <span>{formatCurrency(total / 100)}</span>
        </button>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
