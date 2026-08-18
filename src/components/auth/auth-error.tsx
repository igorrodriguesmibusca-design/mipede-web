"use client";

import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  account_not_linked:
    "Já existe uma conta com este e-mail. Não foi possível vincular o acesso pelo Google. Tente novamente ou entre em contato com o suporte.",
  state_mismatch: "Não foi possível validar o acesso. Feche a aba, limpe os cookies deste site e tente de novo.",
  unable_to_create_user: "Não foi possível concluir o acesso. Tente novamente.",
  signup_disabled: "O cadastro com este método não está disponível.",
};

export function AuthError() {
  const search = useSearchParams();
  const code = search.get("error");
  if (!code) return null;
  const message = MESSAGES[code] ?? "Não foi possível concluir o acesso. Tente novamente.";
  return <p className="mb-4 text-sm text-red-600">{message}</p>;
}
