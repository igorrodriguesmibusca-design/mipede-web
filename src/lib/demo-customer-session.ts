import { useSyncExternalStore } from "react";

import {
  DEMO_SESSION_KEY,
  DEMO_SESSION_TOKENS,
  profileFromDemoToken,
  type DemoCustomerProfile,
} from "@/data/mock-customer-profile";

export { DEMO_SESSION_KEY, DEMO_SESSION_TOKENS };

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function readDemoSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_SESSION_KEY);
}

export function writeDemoSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  // Somente token opaco. Nunca gravar nome, WhatsApp ou endereço.
  window.localStorage.setItem(DEMO_SESSION_KEY, token);
  emit();
}

export function clearDemoSessionToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  emit();
}

export function readDemoProfile(): DemoCustomerProfile | null {
  return profileFromDemoToken(readDemoSessionToken());
}

export function useDemoSessionToken(): string | null {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    readDemoSessionToken,
    () => null,
  );
}
