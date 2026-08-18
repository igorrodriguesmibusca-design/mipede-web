"use client";

import { useRouter } from "next/navigation";

import {
  DEMO_SESSION_TOKENS,
} from "@/data/mock-customer-profile";
import { clearDemoSessionToken, writeDemoSessionToken } from "@/lib/demo-customer-session";
import { routes } from "@/lib/routes";

export function DemoCustomerSessionControls() {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-dashed border-brand/40 bg-orange-50/60 p-4">
      <p className="mb-1 text-sm font-semibold text-brand">Ferramenta de protótipo</p>
      <p className="mb-3 text-xs text-subtle">
        Não faz parte do cardápio do consumidor. Salva apenas um token opaco, nunca nome,
        WhatsApp ou endereço.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            writeDemoSessionToken(DEMO_SESSION_TOKENS.withAddress);
            router.push(routes.store.identify);
          }}
          className="h-10 rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Simular cliente recorrente
        </button>
        <button
          type="button"
          onClick={() => {
            writeDemoSessionToken(DEMO_SESSION_TOKENS.withoutAddress);
            router.push(routes.store.identify);
          }}
          className="h-10 rounded-xl border border-brand text-sm font-semibold text-brand"
        >
          Recorrente sem endereço
        </button>
        <button
          type="button"
          onClick={() => {
            clearDemoSessionToken();
            router.push(routes.store.identify);
          }}
          className="h-10 rounded-xl border text-sm"
        >
          Limpar reconhecimento
        </button>
      </div>
    </div>
  );
}
