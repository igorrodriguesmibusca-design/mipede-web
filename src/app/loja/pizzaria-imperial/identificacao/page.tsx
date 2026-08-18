import { Suspense } from "react";

import { IdentifyClient } from "@/components/storefront/identify-client";
import { PageHeader } from "@/components/storefront/page-header";
import { routes } from "@/lib/routes";

export default function IdentifyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Identifique-se" href={routes.store.cart} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-5">
        <Suspense fallback={<p className="text-sm text-subtle">Carregando identificação…</p>}>
          <IdentifyClient />
        </Suspense>
      </div>
    </div>
  );
}
