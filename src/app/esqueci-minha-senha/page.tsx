import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe o e-mail do responsável. Se a conta existir, enviaremos o link de redefinição."
    >
      <ForgotForm />
    </AuthShell>
  );
}
