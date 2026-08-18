import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { routes } from "@/lib/routes";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Redefinir senha" description="O acesso com e-mail e senha estará disponível futuramente.">
      <Link href={routes.auth.login} className="text-sm font-medium text-brand hover:underline">
        Entrar com Google
      </Link>
    </AuthShell>
  );
}
