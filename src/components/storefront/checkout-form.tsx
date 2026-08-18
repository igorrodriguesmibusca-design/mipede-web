import Link from "next/link";
import { CircleDollarSign, CreditCard, MapPin, User } from "lucide-react";

import { PageHeader } from "@/components/storefront/page-header";
import { PrimaryCta } from "@/components/storefront/primary-cta";
import { StoreHeader } from "@/components/storefront/store-header";
import { Card } from "@/components/ui/card";
import { cartTotal } from "@/data/mock-orders";
import { customer, store } from "@/data/mock-store";
import { routes } from "@/lib/routes";
import { cn, formatCurrency } from "@/lib/utils";

export function CheckoutForm({ withAddress = false }: { withAddress?: boolean }) {
  return (
    <div className="pb-28 md:pb-10">
      <div className="hidden md:block">
        <StoreHeader compact />
      </div>
      <PageHeader title="Finalizar Pedido" href={routes.store.identifyFilled} />

      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <User className="size-4 text-brand" />
            O pedido será entregue para:
          </h2>
          <div className="mb-3 space-y-1 text-sm">
            <Row label="Nome" value={customer.name} />
            <Row label="WhatsApp" value={customer.whatsapp} />
          </div>
          <Link
            href={routes.store.identifyFilled}
            className="flex h-10 items-center justify-center rounded-lg border border-brand text-sm font-semibold text-brand"
          >
            Trocar
          </Link>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <MapPin className="size-4 text-brand" />
            Escolha como receber o pedido
          </h2>
          {withAddress ? (
            <Radio
              active
              title="Meu endereço"
              subtitle={customer.addressLine}
              action="Trocar"
              href={routes.store.address}
            />
          ) : (
            <Radio
              title="Cadastrar endereço"
              href={routes.store.address}
            />
          )}
          <Radio title="Consumir no local" subtitle={store.addressShort} />
          <Radio title="Retirar no estabelecimento" subtitle={store.addressShort} />
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CircleDollarSign className="size-4 text-brand" />
            Tipo de Pagamento
          </h2>
          <Radio title="Online" />
          <Radio title="No momento da Entrega" />
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CreditCard className="size-4 text-brand" />
            Forma de pagamento
          </h2>
          <Radio title="Dinheiro" />
          <Radio title="Via PIX" />
          <Radio title="Cartão de Débito ou Crédito" />
        </Card>

        <div>
          <div className="rounded-t-xl bg-zinc-100 px-4 py-2 text-sm font-semibold">
            Observações
          </div>
          <textarea
            readOnly
            placeholder="Ex: Não buzinar"
            className="h-24 w-full rounded-b-xl border border-zinc-200 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-white p-4 md:static md:mx-auto md:max-w-3xl md:px-4">
        <PrimaryCta
          href={routes.store.orders}
          label="Finalizar Pedido"
          value={formatCurrency(cartTotal)}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-subtle">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Radio({
  title,
  subtitle,
  active = false,
  action,
  href,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
  action?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-0">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 size-4 rounded-full border",
            active ? "border-4 border-brand" : "border-zinc-300",
          )}
        />
        <div>
          <p className="text-sm font-medium">{title}</p>
          {subtitle ? <p className="text-xs text-subtle">{subtitle}</p> : null}
        </div>
      </div>
      {action ? (
        <span className="rounded-lg border border-brand px-3 py-1 text-xs font-semibold text-brand">
          {action}
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
