import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { routes } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Cadastrar restaurante"
      description="Crie o acesso do responsável. CNPJ e dados da loja entram no onboarding."
      footer={
        <p>
          Já possui conta?{" "}
          <Link href={routes.auth.login} className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
