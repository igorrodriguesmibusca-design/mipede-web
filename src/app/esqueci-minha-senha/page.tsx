import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { routes } from "@/lib/routes";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperação de senha"
      description="O acesso com e-mail e senha estará disponível futuramente."
      footer={
        <Link href={routes.auth.login} className="font-medium text-brand hover:underline">
          Entrar com Google
        </Link>
      }
    >
      <p className="text-sm text-subtle">Use Continuar com Google para acessar sua conta.</p>
    </AuthShell>
  );
}
