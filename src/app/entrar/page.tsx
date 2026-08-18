import { Suspense } from "react";
import Link from "next/link";

import { AuthError } from "@/components/auth/auth-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  return (
    <AuthShell
      title="Acesse sua conta"
      description="Entre com Google para gerenciar o restaurante."
      footer={
        <div className="flex flex-col gap-2">
          <p>
            Ainda não tem loja?{" "}
            <Link href={routes.auth.register} className="font-medium text-brand hover:underline">
              Criar conta de restaurante
            </Link>
          </p>
          <p className="text-xs">O acesso com e-mail e senha estará disponível futuramente.</p>
        </div>
      }
    >
      <Suspense>
        <AuthError />
      </Suspense>
      <GoogleButton />
    </AuthShell>
  );
}
