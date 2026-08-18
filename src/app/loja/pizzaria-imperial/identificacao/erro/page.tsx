import { CustomerIdentificationForm } from "@/components/storefront/customer-identification-form";
import { PageHeader } from "@/components/storefront/page-header";
import { routes } from "@/lib/routes";

export default function IdentifyErrorPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Identifique-se" href={routes.store.cart} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-5">
        <CustomerIdentificationForm
          initialName="Juliana Lima"
          initialWhatsapp="(11) 98765-432"
          showError
        />
      </div>
    </div>
  );
}
