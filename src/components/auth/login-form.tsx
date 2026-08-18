"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/mipede/v1/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (response.status === 503) {
        setError(data.message ?? "Login ainda depende do Worker de controle.");
        return;
      }
      if (!response.ok) {
        setError("E-mail ou senha inválidos.");
        return;
      }
      router.push(search.get("next") || routes.admin.performance);
      router.refresh();
    } catch {
      setError("Não foi possível entrar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">E-mail</span>
        <Input name="email" type="email" required autoComplete="email" />
      </label>
      <PasswordField
        id="password"
        name="password"
        label="Senha"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
