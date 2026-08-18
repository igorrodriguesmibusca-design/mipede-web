import { Suspense } from "react";

import { CheckoutForm } from "@/components/storefront/checkout-form";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-subtle">Carregando finalização…</p>}>
      <CheckoutForm />
    </Suspense>
  );
}
