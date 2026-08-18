import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPhone(value: string): string {
  return value;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function variationPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatVariation(current: number, previous: number): string {
  const value = variationPercent(current, previous);
  if (value === null) return "Sem comparação";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatPercent(value)}`;
}
