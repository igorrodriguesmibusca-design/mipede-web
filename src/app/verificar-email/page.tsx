import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { routes } from "@/lib/routes";

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verificação de e-mail" description="O acesso atual é feito com Google, sem envio de e-mail pelo MiPede.">
      <Link href={routes.auth.login} className="text-sm font-medium text-brand hover:underline">
        Entrar com Google
      </Link>
    </AuthShell>
  );
}
