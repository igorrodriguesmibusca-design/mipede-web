"use client";

import { createContext, useContext } from "react";

import type { TenantView } from "@/server/session";

const TenantContext = createContext<TenantView>({ mode: "demo" });

export function TenantProvider({
  value,
  children,
}: {
  value: TenantView;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantView {
  return useContext(TenantContext);
}
