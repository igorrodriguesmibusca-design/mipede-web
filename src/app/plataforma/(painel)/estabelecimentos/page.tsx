import { Suspense } from "react";

import { PlatformStoresPanel } from "@/components/platform/stores-panel";

export default function PlatformStoresPage() {
  return (
    <Suspense fallback={<p className="text-sm text-subtle">Carregando estabelecimentos...</p>}>
      <PlatformStoresPanel />
    </Suspense>
  );
}
