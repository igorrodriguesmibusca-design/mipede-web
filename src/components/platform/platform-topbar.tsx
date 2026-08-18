"use client";

import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { PlatformRoleBadge } from "@/components/platform/platform-role-badge";
import { routes } from "@/lib/routes";

export function PlatformTopbar({
  userName,
  role,
  onMenu,
}: {
  userName: string;
  role: string;
  onMenu?: () => void;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-100 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-lg text-ink hover:bg-zinc-50 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
        <MipedeLogo />
        <span className="hidden h-8 w-px bg-zinc-200 sm:block" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold">Painel da Plataforma</p>
          <p className="truncate text-xs text-subtle">{userName || "Equipe MiPede"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PlatformRoleBadge role={role} className="hidden sm:inline-flex" />
        <button
          type="button"
          className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
          onClick={() => {
            void fetch("/api/mipede/auth/sign-out", { method: "POST", credentials: "include" }).then(() => {
              router.push(routes.auth.login);
              router.refresh();
            });
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
