"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type PlatformFilterOption = {
  value: string;
  label: string;
};

export function PlatformFilters({
  search,
  searchPlaceholder,
  onSearchChange,
  filters,
  onClear,
  resultCount,
}: {
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    id: string;
    label: string;
    value: string;
    options: PlatformFilterOption[];
    onChange: (value: string) => void;
  }>;
  onClear?: () => void;
  resultCount?: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {onSearchChange ? (
            <label className="block text-xs font-medium text-subtle">
              Buscar
              <Input
                className="mt-1 h-11"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
              />
            </label>
          ) : null}
          {filters?.map((filter) => (
            <label key={filter.id} className="block text-xs font-medium text-subtle">
              {filter.label}
              <select
                className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-ink outline-none focus:border-brand"
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {onClear ? (
          <Button type="button" variant="outline" className="h-11" onClick={onClear}>
            Limpar filtros
          </Button>
        ) : null}
      </div>
      {typeof resultCount === "number" ? (
        <p className="text-sm text-subtle">
          {resultCount === 1 ? "1 resultado encontrado" : `${resultCount} resultados encontrados`}
        </p>
      ) : null}
    </div>
  );
}
