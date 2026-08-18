"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";

import { LiveSettingsPage } from "@/components/admin/live-settings-page";
import { useTenant } from "@/lib/tenant-context";

import { PageHeading } from "@/components/admin/page-heading";
import { StatusPill } from "@/components/admin/status-pill";
import { StoreMark } from "@/components/brand/store-mark";
import { Switch } from "@/components/ui/switch";
import { products } from "@/data/mock-products";
import { store } from "@/data/mock-store";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export default function StoreSettingsPage() {
  const tenant = useTenant();
  if (tenant.mode === "live") return <LiveSettingsPage />;
  const previewProducts = products.slice(0, 3);

  return (
    <div>
      <PageHeading
        title="Configuração da Loja"
        description="Personalize as informações exibidas no seu cardápio"
        action={
          <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Salvar alterações
          </span>
        }
      />

      <div className="mb-5 flex gap-5 overflow-x-auto text-sm">
        {["Informações", "Identidade visual", "Horários", "Atendimento"].map((tab, index) => (
          <span
            key={tab}
            className={index === 0 ? "border-b-2 border-brand pb-2 font-semibold text-brand" : "text-zinc-500"}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-zinc-100 p-5">
          <div className="grid gap-5 md:grid-cols-[160px_1fr]">
            <div>
              <p className="mb-2 text-sm font-medium">Logo da loja</p>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <StoreMark className="h-36 w-full" />
              </div>
              <span className="mt-2 flex h-10 items-center justify-center rounded-xl border border-zinc-200 text-sm">
                Alterar logo
              </span>
              <p className="mt-1 text-[11px] text-subtle">PNG ou JPG. Máx. 2MB.</p>
            </div>
            <div className="space-y-4">
              <Field label="Nome da loja" value={store.name} />
              <Field label="WhatsApp" value={store.whatsapp} />
              <Field label="Endereço" value={store.address} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pedido mínimo" value="30,00" prefix="R$" />
                <label>
                  <span className="mb-1 block text-sm font-medium">Tempo estimado</span>
                  <select className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm">
                    <option>{store.eta}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-zinc-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status da loja</p>
                <p className="text-xs text-subtle">Sua loja está visível para receber pedidos.</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill value="Aberto" />
                <Switch checked aria-label="Status da loja" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-100 p-4">
            <p className="mb-1 font-medium">Link do cardápio</p>
            <p className="mb-3 text-xs text-subtle">
              Compartilhe este link para que seus clientes acessem seu cardápio.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={store.cardapioUrl}
                className="h-11 flex-1 rounded-xl border border-zinc-200 px-3 text-sm"
              />
              <span className="inline-flex h-11 items-center gap-1 rounded-xl border border-zinc-200 px-3 text-sm">
                <Copy className="size-4" />
                Copiar
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-100 p-4">
            <p className="mb-3 font-medium">Prévia do cardápio</p>
            <div className="overflow-hidden rounded-xl bg-zinc-900 p-3 text-white">
              <p className="text-sm font-semibold">
                {store.name} <span className="ml-2 text-xs text-emerald-400">Aberto</span>
              </p>
              <p className="text-xs text-white/70">
                {store.eta} · Pedido mínimo {formatCurrency(store.minOrder)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {previewProducts.map((product) => (
                  <div key={product.id} className="overflow-hidden rounded-lg bg-white text-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt="" className="h-16 w-full object-cover" />
                    <p className="truncate px-1.5 py-1 text-[10px] font-medium">{product.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href={routes.store.home}
              className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl border border-brand text-sm font-semibold text-brand"
            >
              <ExternalLink className="size-4" />
              Visualizar cardápio
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  prefix,
}: {
  label: string;
  value: string;
  prefix?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex">
        {prefix ? (
          <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm text-subtle">
            {prefix}
          </span>
        ) : null}
        <input
          readOnly
          defaultValue={value}
          className={prefix ? "h-11 w-full rounded-r-xl border border-zinc-200 px-3 text-sm" : "h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"}
        />
      </div>
    </label>
  );
}
