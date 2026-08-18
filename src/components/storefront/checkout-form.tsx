"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleDollarSign, CreditCard, MapPin } from "lucide-react";

import { CustomerDataSummary } from "@/components/storefront/customer-data-summary";
import { PageHeader } from "@/components/storefront/page-header";
import { SavedAddressSelector } from "@/components/storefront/saved-address-selector";
import { StoreHeader } from "@/components/storefront/store-header";
import { Card } from "@/components/ui/card";
import { demoCustomerJuliana, formatAddressLine, profileFromDemoToken } from "@/data/mock-customer-profile";
import { cartTotal } from "@/data/mock-orders";
import { store } from "@/data/mock-store";
import { DEMO_SESSION_TOKENS, useDemoSessionToken, writeDemoSessionToken } from "@/lib/demo-customer-session";
import { routes } from "@/lib/routes";
import { cn, formatCurrency } from "@/lib/utils";

type Fulfillment = "entrega" | "retirada" | "local";

export function CheckoutForm({ withAddress = false }: { withAddress?: boolean }) {
  return (
    <CheckoutInner withAddress={withAddress} />
  );
}

function CheckoutInner({ withAddress }: { withAddress: boolean }) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode: Fulfillment =
    modeParam === "retirada" || modeParam === "local" || modeParam === "entrega"
      ? modeParam
      : withAddress
        ? "entrega"
        : "entrega";

  const [mode, setMode] = useState<Fulfillment>(initialMode);
  const token = useDemoSessionToken();
  const recognizedProfile = profileFromDemoToken(token);
  const profileName = recognizedProfile?.name ?? demoCustomerJuliana.name;
  const profilePhone = recognizedProfile?.whatsapp ?? demoCustomerJuliana.whatsapp;
  const addresses = recognizedProfile?.addresses ?? [];
  const defaultAddressId =
    addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultAddressId);
  const currentAddressId = selectedId || defaultAddressId;

  const selectedAddress = addresses.find((item) => item.id === currentAddressId);
  const needsAddress = mode === "entrega";

  return (
    <div className="pb-28 md:pb-10">
      <div className="hidden md:block">
        <StoreHeader compact />
      </div>
      <PageHeader title="Finalizar Pedido" href={routes.store.identify} />

      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
        <CustomerDataSummary name={profileName} whatsapp={profilePhone} />

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <MapPin className="size-4 text-brand" />
            Escolha como receber o pedido
          </h2>
          <button type="button" className="w-full text-left" onClick={() => setMode("entrega")}>
            <RadioRow active={mode === "entrega"} title="Entrega no meu endereço" subtitle={selectedAddress ? formatAddressLine(selectedAddress) : "Cadastrar ou escolher endereço"} />
          </button>
          <button type="button" className="w-full text-left" onClick={() => setMode("local")}>
            <RadioRow active={mode === "local"} title="Consumir no local" subtitle={store.addressShort} />
          </button>
          <button type="button" className="w-full text-left" onClick={() => setMode("retirada")}>
            <RadioRow active={mode === "retirada"} title="Retirar no estabelecimento" subtitle={store.addressShort} />
          </button>
        </Card>

        {needsAddress ? (
          <Card className="p-4">
            <h2 className="mb-3 font-semibold">Endereço de entrega</h2>
            {addresses.length > 0 ? (
              <SavedAddressSelector
                addresses={addresses}
                selectedId={currentAddressId}
                onSelect={setSelectedId}
              />
            ) : (
              <Link href={routes.store.address} className="flex h-11 items-center justify-center rounded-xl border border-brand text-sm font-semibold text-brand">
                Cadastrar endereço
              </Link>
            )}
          </Card>
        ) : (
          <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-subtle">
            Retirada e consumo no local não exigem endereço.
          </p>
        )}

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CircleDollarSign className="size-4 text-brand" />
            Tipo de Pagamento
          </h2>
          <RadioRow title="No momento da Entrega" active />
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CreditCard className="size-4 text-brand" />
            Forma de pagamento
          </h2>
          <RadioRow title="Dinheiro" />
          <RadioRow title="Via PIX" active />
          <RadioRow title="Cartão de Débito ou Crédito" />
        </Card>

        <div>
          <div className="rounded-t-xl bg-zinc-100 px-4 py-2 text-sm font-semibold">Observações</div>
          <textarea
            placeholder="Ex: Não buzinar"
            className="h-24 w-full rounded-b-xl border border-zinc-200 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-white p-4 md:static md:mx-auto md:max-w-3xl md:px-4">
        <Link
          href={needsAddress && addresses.length === 0 ? routes.store.address : routes.store.orders}
          onClick={() => {
            if (!recognizedProfile) {
              writeDemoSessionToken(DEMO_SESSION_TOKENS.withAddress);
            }
          }}
          className="flex h-12 w-full items-center justify-between rounded-xl bg-brand px-5 text-sm font-semibold text-white"
        >
          <span>Finalizar Pedido</span>
          <span>{formatCurrency(cartTotal)}</span>
        </Link>
      </div>
    </div>
  );
}

function RadioRow({
  title,
  subtitle,
  active = false,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-0">
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 size-4 rounded-full border", active ? "border-4 border-brand" : "border-zinc-300")} />
        <div>
          <p className="text-sm font-medium">{title}</p>
          {subtitle ? <p className="text-xs text-subtle">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}
