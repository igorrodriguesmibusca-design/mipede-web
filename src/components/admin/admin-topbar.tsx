import { useRouter } from "next/navigation";
import { Bell, Menu } from "lucide-react";

import { ShareStoreButton } from "@/components/admin/share-store-link";
import { MipedeLogo } from "@/components/brand/mipede-mark";
import { store } from "@/data/mock-store";
import { routes } from "@/lib/routes";
import { storeApprovalLabel } from "@/server/onboarding-store";
import { useTenant } from "@/lib/tenant-context";

export function AdminTopbar({ onMenu }: { onMenu?: () => void }) {
  const tenant = useTenant();
  const router = useRouter();
  const storeName = tenant.mode === "live" ? (tenant.store?.name ?? "Sua loja") : store.name;
  const storeStatus = tenant.mode === "live" ? storeApprovalLabel(tenant.store?.status) : store.status;
  const statusTone = storeStatus === "Ativa" || storeStatus === "Aberto" ? "text-success" : "text-amber-600";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-100 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-lg text-ink lg:pointer-events-none"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
        <MipedeLogo />
        <span className="hidden h-8 w-px bg-zinc-200 sm:block" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold">{storeName}</p>
          <p className={`flex items-center gap-1 text-xs font-medium ${statusTone}`}>
            {storeStatus}
            <span className={`size-1.5 rounded-full ${storeStatus === "Ativa" || storeStatus === "Aberto" ? "bg-success" : "bg-amber-500"}`} />
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {tenant.mode === "live" ? (
          <button
            type="button"
            className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold"
            onClick={() => {
              void fetch("/api/mipede/auth/sign-out", { method: "POST", credentials: "include" }).then(() => {
                router.push(routes.auth.login);
                router.refresh();
              });
            }}
          >
            Sair
          </button>
        ) : null}
        <span
          aria-label="Notificações"
          className="relative flex size-10 items-center justify-center rounded-full border border-zinc-200"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-brand" />
        </span>
        <ShareStoreButton />
      </div>
    </header>
  );
}
