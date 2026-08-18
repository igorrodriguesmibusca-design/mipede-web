"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.8-2.5 3.6v3h4c2.4-2.2 3.5-5.4 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.9l-4-3c-1.1.8-2.5 1.2-3.9 1.2-3 0-5.6-2-6.5-4.8H1.4v3.1C3.4 21.3 7.4 24 12 24Z" />
      <path fill="#FBBC05" d="M5.5 14.5c-.2-.7-.4-1.4-.4-2.5s.1-1.8.4-2.5V6.4H1.4C.5 8.2 0 10.1 0 12s.5 3.8 1.4 5.6l4.1-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.4l4.1 3.1C6.4 6.8 9 4.8 12 4.8Z" />
    </svg>
  );
}

export function GoogleButton({ requireTerms = false }: { requireTerms?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    if (requireTerms && (form.get("acceptTerms") !== "on" || form.get("acceptPrivacy") !== "on")) {
      setError("Aceite os Termos e a Política de Privacidade para continuar.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/mipede/v1/auth/google/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          acceptTerms: requireTerms ? form.get("acceptTerms") === "on" : true,
          acceptPrivacy: requireTerms ? form.get("acceptPrivacy") === "on" : true,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (response.status === 403 && payload.error === "auth_method_unavailable") {
        setError("Este método de acesso não está disponível.");
        return;
      }
      if (!response.ok || !payload.url) {
        setError("Não foi possível iniciar o acesso com Google.");
        return;
      }
      if (!payload.url.startsWith("https://accounts.google.com/")) {
        setError("Resposta de autenticação inválida.");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setError("Não foi possível iniciar o acesso com Google.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void start(event)}>
      {requireTerms ? (
        <>
          <label className="flex items-start gap-2 text-sm">
            <input name="acceptTerms" type="checkbox" required className="mt-1" />
            <span>Aceito os Termos de Uso</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input name="acceptPrivacy" type="checkbox" required className="mt-1" />
            <span>Aceito a Política de Privacidade</span>
          </label>
        </>
      ) : (
        <p className="text-xs text-subtle">
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl bg-white text-ink border border-zinc-200 hover:bg-zinc-50">
        <GoogleMark />
        {pending ? "Redirecionando..." : "Continuar com Google"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
