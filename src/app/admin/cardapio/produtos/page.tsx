"use client";

import Link from "next/link";
import { ArrowUpDown, Copy, MoreVertical, Pencil, Search } from "lucide-react";

import { LiveProductsPage } from "@/components/admin/live-products-page";
import { useTenant } from "@/lib/tenant-context";

import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { products } from "@/data/mock-products";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const tenant = useTenant();
  if (tenant.mode === "live") return <LiveProductsPage />;
  return (
    <div>
      <PageHeading
        title="Produtos"
        description="Gerencie os itens disponíveis no seu cardápio"
        action={
          <Link
            href={routes.admin.productNew}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
          >
            Novo produto
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_160px_160px]">
        <label className="relative">
          <span className="sr-only">Buscar produto</span>
          <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
          <input
            readOnly
            placeholder="Buscar produto"
            className="h-11 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm"
          />
        </label>
        <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm">
          <option>Todas as categorias</option>
        </select>
        <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm">
          <option>Todos os status</option>
        </select>
        <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm">
          <ArrowUpDown className="size-4" />
          Ordenar produtos
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Produto", "Categoria", "Preço", "Promoção", "Disponibilidade", "Status", "Ações"].map(
                  (head) => (
                    <th key={head} className="px-4 py-3 font-medium">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 overflow-hidden rounded-lg bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.categoryName}</td>
                  <td className="px-4 py-3">
                    {product.previousPrice ? (
                      <span>
                        <span className="block text-xs text-zinc-400 line-through">
                          {formatCurrency(product.previousPrice)}
                        </span>
                        <span className="font-semibold text-brand">
                          {formatCurrency(product.price)}
                        </span>
                      </span>
                    ) : (
                      formatCurrency(product.price)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.discount ? (
                      <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-brand">
                        {product.discount}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={product.available} aria-label="Disponibilidade" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill value={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-2 text-zinc-400">
                      <Pencil className="size-4" />
                      <Copy className="size-4" />
                      <MoreVertical className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="Mostrando 1 a 8 de 23 produtos" pages={[1, 2, 3, "…", 5]} />
      </div>
    </div>
  );
}
