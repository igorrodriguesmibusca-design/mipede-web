import { Suspense } from "react";

import { CheckoutForm } from "@/components/storefront/checkout-form";

export default function CheckoutAddressPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-subtle">Carregando finalização…</p>}>
      <CheckoutForm withAddress />
    </Suspense>
  );
}
