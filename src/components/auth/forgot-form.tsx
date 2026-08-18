"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/mipede/v1/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          turnstileToken: "dev-bypass",
        }),
      });
      if (response.status === 503) {
        setError("Recuperação de senha aguarda o Worker e o Resend.");
        return;
      }
      if (!response.ok) {
        setError("Não foi possível enviar o e-mail.");
        return;
      }
      setDone(true);
    } catch {
      setError("Não foi possível enviar o e-mail.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="text-sm text-ink">Se o e-mail existir, enviaremos as instruções de redefinição.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">E-mail</span>
        <Input name="email" type="email" required autoComplete="email" />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
        {pending ? "Enviando..." : "Enviar instruções"}
      </Button>
    </form>
  );
}
