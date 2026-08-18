"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { formatBrazilPhone, isCompleteBrazilMobile } from "@/lib/phone";
import { routes } from "@/lib/routes";

export function CustomerIdentificationForm({
  initialName = "",
  initialWhatsapp = "",
  showError = false,
}: {
  initialName?: string;
  initialWhatsapp?: string;
  showError?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [submitted, setSubmitted] = useState(showError);

  const nameError = submitted && !name.trim() ? "Informe seu nome e sobrenome." : "";
  const phoneError =
    submitted && !isCompleteBrazilMobile(whatsapp)
      ? "Parece que o número está incompleto."
      : "";

  function submit() {
    setSubmitted(true);
    if (!name.trim() || !isCompleteBrazilMobile(whatsapp)) return;
    router.push(routes.store.checkout);
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="mb-6 text-sm text-subtle">
        Para realizar seu pedido vamos precisar de nome e WhatsApp. Não é necessário criar
        conta, e-mail ou senha.
      </p>

      <label className="mb-2 text-sm font-semibold" htmlFor="whatsapp">
        Digite seu número do WhatsApp:
      </label>
      <Input
        id="whatsapp"
        inputMode="tel"
        autoComplete="tel"
        value={whatsapp}
        onChange={(event) => setWhatsapp(formatBrazilPhone(event.target.value))}
        aria-invalid={Boolean(phoneError)}
        placeholder="(11) 90000-0000"
      />
      {phoneError ? (
        <p className="mt-1.5 text-xs font-medium text-red-500">{phoneError}</p>
      ) : null}

      <label className="mt-5 mb-2 text-sm font-semibold" htmlFor="name">
        Seu Nome e Sobrenome:
      </label>
      <Input
        id="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-invalid={Boolean(nameError)}
        placeholder="Como no documento"
      />
      {nameError ? <p className="mt-1.5 text-xs font-medium text-red-500">{nameError}</p> : null}

      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={submit}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}
