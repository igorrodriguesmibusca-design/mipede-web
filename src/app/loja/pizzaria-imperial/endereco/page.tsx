"use client";

import { useState } from "react";

import { PageHeader } from "@/components/storefront/page-header";
import { SavedAddressSelector } from "@/components/storefront/saved-address-selector";
import { StoreHeader } from "@/components/storefront/store-header";
import { Input } from "@/components/ui/input";
import { profileFromDemoToken } from "@/data/mock-customer-profile";
import { useDemoSessionToken } from "@/lib/demo-customer-session";
import { routes } from "@/lib/routes";

export default function AddressPage() {
  const token = useDemoSessionToken();
  const profile = profileFromDemoToken(token);
  const addresses = profile?.addresses ?? [];
  const defaultId = addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultId);
  const [adding, setAdding] = useState(false);
  const currentId = selectedId || defaultId;

  return (
    <div>
      <div className="hidden md:block">
        <StoreHeader compact />
      </div>
      <PageHeader
        title={addresses.length && !adding ? "Seus endereços" : "Cadastrar Endereço"}
        href={routes.store.checkout}
      />
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-5">
        {addresses.length > 0 && !adding ? (
          <>
            <SavedAddressSelector
              addresses={addresses}
              selectedId={currentId}
              onSelect={setSelectedId}
            />
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-12 items-center justify-center rounded-xl border border-brand text-sm font-semibold text-brand"
            >
              Adicionar endereço
            </button>
            <a
              href={routes.store.checkoutAddress}
              className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
            >
              Usar endereço selecionado
            </a>
          </>
        ) : (
          <AddressForm />
        )}
      </div>
    </div>
  );
}

function AddressForm() {
  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
      <label className="sr-only" htmlFor="region">
        Região
      </label>
      <select
        id="region"
        defaultValue=""
        className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 text-sm text-subtle"
      >
        <option value="" disabled>
          Selecione a Região
        </option>
        <option>Centro</option>
        <option>Zona Norte</option>
        <option>Zona Sul</option>
      </select>
      <Field id="bairro" label="Bairro *" placeholder="Ex.: Bairro Alegre" />
      <Field id="rua" label="Rua *" placeholder="Ex.: Rua Alegre" />
      <Field id="cep" label="CEP *" placeholder="Ex.: 12345-678" />
      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <Field id="numero" label="Número *" placeholder="Ex.: 123" />
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 rounded border-zinc-300" />
          Sem Número
        </label>
      </div>
      <Field id="complemento" label="Complemento" placeholder="Ex.: Casa, Apt" />
      <Field id="referencia" label="Ponto de Referência" placeholder="Em frente ao..." />
      <a
        href={routes.store.checkoutAddress}
        className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
      >
        Salvar Endereço
      </a>
    </form>
  );
}

function Field({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <Input id={id} placeholder={placeholder} />
    </div>
  );
}
