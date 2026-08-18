"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Pencil, Search } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson } from "@/lib/admin-api";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  categoryName: string | null;
  priceCents: number;
  promoPriceCents: number | null;
  imageKey: string | null;
  active: number;
};

export function LiveProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    const payload = await adminJson<{ products: ProductRow[] }>("/api/mipede/v1/catalog/products");
    setRows(payload.products ?? []);
  }

  useEffect(() => {
    void fetch("/api/mipede/v1/catalog/products", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((payload: { products?: ProductRow[] }) => setRows(payload.products ?? []));
  }, []);

  const filtered = rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeading
        title="Produtos"
        description="Gerencie os itens disponíveis no seu cardápio"
        action={
          <Link href={routes.admin.productNew} className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Novo produto
          </Link>
        }
      />
      <div className="mb-4">
        <label className="relative block">
          <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto" className="h-11 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm" />
        </label>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Produto", "Categoria", "Preço", "Promoção", "Disponibilidade", "Status", "Ações"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="font-medium">Nenhum produto criado</p>
                    <p className="mt-1 text-sm text-subtle">Adicione o primeiro item do seu cardápio.</p>
                    <Link href={routes.admin.productNew} className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
                      Criar produto
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.categoryName ?? "Não informado"}</td>
                    <td className="px-4 py-3">{formatCurrency(product.priceCents / 100)}</td>
                    <td className="px-4 py-3">{product.promoPriceCents ? formatCurrency(product.promoPriceCents / 100) : "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          void adminJson(`/api/mipede/v1/catalog/products/${product.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ active: !product.active }),
                          }).then(() => load())
                        }
                      >
                        <Switch checked={Boolean(product.active)} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={product.active ? "Ativo" : "Pausado"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-zinc-400">
                        <Link href={`${routes.admin.productNew}?id=${product.id}`} aria-label="Editar">
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          aria-label="Duplicar"
                          onClick={() =>
                            void adminJson(`/api/mipede/v1/catalog/products/${product.id}/duplicate`, { method: "POST" }).then(() => {
                              setToast("Produto duplicado.");
                              return load();
                            })
                          }
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
