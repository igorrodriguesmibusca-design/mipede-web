"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function ResetForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/mipede/v1/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: search.get("token") ?? "",
          password,
        }),
      });
      if (!response.ok) {
        setError("Não foi possível redefinir a senha. O link pode ter expirado.");
        return;
      }
      router.push(routes.auth.login);
    } catch {
      setError("Não foi possível redefinir a senha.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <PasswordField
        id="password"
        name="password"
        label="Nova senha"
        value={password}
        onChange={setPassword}
        showStrength
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
        {pending ? "Salvando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
