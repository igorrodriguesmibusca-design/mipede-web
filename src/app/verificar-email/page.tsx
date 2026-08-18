"use client";

import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    const response = await fetch("/api/mipede/auth/send-verification-email", {
      method: "POST",
      credentials: "include",
    });
    setMessage(
      response.status === 503
        ? "O envio de e-mail depende do Resend no Worker."
        : "Se o cadastro existir, reenviamos a verificação.",
    );
  }

  return (
    <AuthShell
      title="Verifique seu e-mail"
      description="Enviamos um link de confirmação. Sem essa verificação o painel administrativo permanece bloqueado."
    >
      <p className="text-sm text-subtle">
        Não encontramos o e-mail? Confira o spam. O reenvio é limitado para evitar abuso.
      </p>
      <Button type="button" onClick={() => void resend()} className="mt-5 h-11 w-full rounded-xl">
        Reenviar verificação
      </Button>
      {message ? <p className="mt-3 text-sm text-ink">{message}</p> : null}
    </AuthShell>
  );
}
