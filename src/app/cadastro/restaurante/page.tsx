import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { routes } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crie sua conta de restaurante"
      description="Use sua conta Google. Os dados da loja entram no onboarding."
      footer={
        <div className="flex flex-col gap-2">
          <p>
            Já possui conta?{" "}
            <Link href={routes.auth.login} className="font-medium text-brand hover:underline">
              Entrar
            </Link>
          </p>
          <p className="text-xs">Convites de equipe estarão disponíveis futuramente.</p>
        </div>
      }
    >
      <GoogleButton requireTerms />
    </AuthShell>
  );
}
