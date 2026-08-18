import Link from "next/link";

import { formatAddressLine, type SavedAddress } from "@/data/mock-customer-profile";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function SavedAddressSelector({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {addresses.map((address) => {
        const active = address.id === selectedId;
        return (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address.id)}
            className={cn(
              "w-full rounded-2xl border p-4 text-left",
              active ? "border-brand bg-orange-50" : "border-zinc-200",
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                {address.label}
              </span>
              {address.isDefault ? <span className="text-xs text-subtle">Último usado</span> : null}
            </div>
            <p className="font-medium">{formatAddressLine(address)}</p>
            <p className="text-xs text-subtle">
              {address.city}/{address.state} · CEP {address.postalCode}
            </p>
          </button>
        );
      })}
      <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand">
        <Link href={routes.store.address}>Trocar endereço</Link>
        <Link href={routes.store.address}>Editar</Link>
        <Link href={routes.store.address}>Adicionar endereço</Link>
      </div>
    </div>
  );
}
