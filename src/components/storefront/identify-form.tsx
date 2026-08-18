import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/storefront/page-header";
import { PrimaryCta } from "@/components/storefront/primary-cta";
import { customer } from "@/data/mock-store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type IdentifyState = "empty" | "filled" | "error";

export function IdentifyForm({ state }: { state: IdentifyState }) {
  const filled = state === "filled" || state === "error";
  const error = state === "error";

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Identifique-se" href={routes.store.cart} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-5">
        <p className="mb-6 text-sm text-subtle">
          Para realizar seu pedido vamos precisar de suas informações, este é um
          ambiente protegido.
        </p>

        <label className="mb-2 text-sm font-semibold" htmlFor="whatsapp">
          Digite seu número do WhatsApp:
        </label>
        <Input
          id="whatsapp"
          defaultValue={
            error
              ? customer.whatsappIncomplete
              : filled
                ? customer.whatsapp
                : ""
          }
          aria-invalid={error}
          readOnly
        />
        {error ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
            <span aria-hidden="true">●</span>
            Parece que o número está incompleto.
          </p>
        ) : null}

        <label className="mt-5 mb-2 text-sm font-semibold" htmlFor="name">
          Seu Nome e Sobrenome:
        </label>
        <Input
          id="name"
          defaultValue={filled ? customer.name : ""}
          readOnly
        />

        <div className="mt-auto pt-10">
          <PrimaryCta
            href={state === "filled" ? routes.store.checkout : undefined}
            label="Avançar"
            disabled={state !== "filled"}
            className={cn(state !== "filled" && "bg-zinc-400")}
          />
        </div>
      </div>
    </div>
  );
}
