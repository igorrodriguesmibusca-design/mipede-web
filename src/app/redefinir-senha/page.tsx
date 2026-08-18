import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Redefinir senha" description="Escolha uma senha nova. As sessões anteriores serão encerradas.">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
