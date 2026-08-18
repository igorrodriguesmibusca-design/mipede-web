import { Suspense } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesso do responsável, administrador ou operador da loja."
      footer={
        <div className="flex flex-col gap-2">
          <Link href={routes.auth.forgot} className="font-medium text-brand hover:underline">
            Esqueci minha senha
          </Link>
          <p>
            Ainda não tem loja?{" "}
            <Link href={routes.auth.register} className="font-medium text-brand hover:underline">
              Cadastrar restaurante
            </Link>
          </p>
        </div>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
