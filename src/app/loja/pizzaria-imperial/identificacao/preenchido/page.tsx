import { CustomerIdentificationForm } from "@/components/storefront/customer-identification-form";
import { PageHeader } from "@/components/storefront/page-header";
import { demoCustomerJuliana } from "@/data/mock-customer-profile";
import { routes } from "@/lib/routes";

export default function IdentifyFilledPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Identifique-se" href={routes.store.cart} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-5">
        <CustomerIdentificationForm
          initialName={demoCustomerJuliana.name}
          initialWhatsapp={demoCustomerJuliana.whatsapp}
        />
      </div>
    </div>
  );
}
