"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function InviteAccept({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function accept() {
    setPending(true);
    const response = await fetch("/api/mipede/v1/platform/invites/accept", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (response.status === 401) {
      setError("Entre com a conta Google convidada.");
      setPending(false);
      return;
    }
    if (!response.ok) {
      setError("Este convite não pode ser usado.");
      setPending(false);
      return;
    }
    router.push(routes.platform.root);
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-zinc-50 px-5 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Convite interno MiPede</h1>
        <p className="mt-2 text-sm text-subtle">
          Entre com a conta Google do e-mail convidado. O e-mail precisa estar verificado.
        </p>
        <div className="mt-5">
          <GoogleButton />
        </div>
        <Button className="mt-4 w-full" disabled={pending} onClick={() => void accept()}>
          Aceitar convite
        </Button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
