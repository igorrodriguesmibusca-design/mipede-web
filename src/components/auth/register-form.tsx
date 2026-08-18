"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      password,
      confirmPassword,
      acceptTerms: form.get("acceptTerms") === "on",
      acceptPrivacy: form.get("acceptPrivacy") === "on",
      turnstileToken: String(form.get("turnstileToken") || "dev-bypass"),
    };

    setPending(true);
    try {
      const response = await fetch("/api/mipede/v1/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (response.status === 503) {
        setError(data.message ?? "Cadastro ainda não está ligado ao Worker. Configure a API de controle.");
        return;
      }
      if (!response.ok) {
        setError(
          data.error === "turnstile_failed"
            ? "Validação anti-bot recusada."
            : data.error === "forbidden_role"
              ? "Função inválida."
              : "Revise os dados e tente novamente.",
        );
        return;
      }
      router.push(routes.auth.verifyEmail);
    } catch {
      setError("Não foi possível concluir o cadastro.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Nome completo</span>
        <Input name="name" required minLength={3} autoComplete="name" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">E-mail profissional</span>
        <Input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">WhatsApp</span>
        <Input name="whatsapp" required minLength={10} autoComplete="tel" placeholder="11999999999" />
      </label>
      <PasswordField
        id="password"
        name="password"
        label="Senha"
        value={password}
        onChange={setPassword}
        showStrength
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirmar senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />
      <label className="flex items-start gap-2 text-sm">
        <input name="acceptTerms" type="checkbox" required className="mt-1" />
        <span>Aceito os Termos de Uso</span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input name="acceptPrivacy" type="checkbox" required className="mt-1" />
        <span>Aceito a Política de Privacidade</span>
      </label>
      <input type="hidden" name="turnstileToken" value="dev-bypass" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
        {pending ? "Enviando..." : "Criar cadastro"}
      </Button>
    </form>
  );
}
