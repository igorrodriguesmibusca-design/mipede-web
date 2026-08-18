import { Badge } from "@/components/ui/badge";

const variants: Record<string, "success" | "warning" | "muted" | "info" | "default"> = {
  Ativo: "success",
  Ativa: "success",
  Aberto: "success",
  Finalizado: "success",
  "Em entrega": "success",
  Aceito: "info",
  Novo: "warning",
  "Em produção": "warning",
  Pausado: "muted",
  Pausada: "muted",
  Esgotado: "muted",
  Cancelado: "muted",
};

export function StatusPill({ value }: { value: string }) {
  return <Badge variant={variants[value] ?? "muted"}>{value}</Badge>;
}
