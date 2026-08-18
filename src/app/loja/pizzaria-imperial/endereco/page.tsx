import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/storefront/page-header";
import { PrimaryCta } from "@/components/storefront/primary-cta";
import { StoreHeader } from "@/components/storefront/store-header";
import { routes } from "@/lib/routes";

export default function AddressPage() {
  return (
    <div>
      <div className="hidden md:block">
        <StoreHeader compact />
      </div>
      <PageHeader title="Cadastrar Endereço" href={routes.store.checkout} />
      <form className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-5">
        <label className="sr-only" htmlFor="region">
          Região
        </label>
        <div className="relative">
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
        </div>

        <Field id="bairro" label="Bairro *" placeholder="Ex.: Bairro Alegre" />
        <Field id="rua" label="Rua *" placeholder="Ex.: Rua Alegre" />
        <Field id="cep" label="CEP *" placeholder="Ex.: 12345-678" />

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <Field id="numero" label="Número *" placeholder="Ex.: 123" />
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 rounded border-zinc-300" readOnly />
            Sem Número
          </label>
        </div>

        <Field id="complemento" label="Complemento" placeholder="Ex.: Casa, Apt" />
        <Field
          id="referencia"
          label="Ponto de Referência"
          placeholder="Em frente ao..."
        />

        <div className="pt-4">
          <PrimaryCta href={routes.store.checkoutAddress} label="Salvar Endereço" />
        </div>
      </form>
    </div>
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
      <Input id={id} placeholder={placeholder} readOnly />
    </div>
  );
}
