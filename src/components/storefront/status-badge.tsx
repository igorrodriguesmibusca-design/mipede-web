import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/data/mock-orders";

const map: Record<OrderStatus, { label: string; variant: "success" | "warning" | "muted" | "info" | "default" }> =
  {
    Novo: { label: "Novo", variant: "warning" },
    Aceito: { label: "Aceito", variant: "info" },
    "Em produção": { label: "Em produção", variant: "warning" },
    "Em entrega": { label: "Em entrega", variant: "success" },
    Finalizado: { label: "Finalizado", variant: "success" },
    Cancelado: { label: "Cancelado", variant: "muted" },
    "Em andamento": { label: "Em andamento", variant: "warning" },
  };

export function StatusBadge({ status }: { status: OrderStatus }) {
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
