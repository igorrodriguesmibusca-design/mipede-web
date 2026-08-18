import { PlatformStoresPanel } from "@/components/platform/stores-panel";

export default function PlatformStoresPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Estabelecimentos</h1>
      <p className="mt-1 text-sm text-subtle">Aprovar, rejeitar, suspender e reativar lojas.</p>
      <PlatformStoresPanel />
    </div>
  );
}
