import { Info, Pencil, Trash2 } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { StatusPill } from "@/components/admin/status-pill";
import { Switch } from "@/components/ui/switch";
import { deliveryRegions } from "@/data/mock-store";
import { formatCurrency } from "@/lib/utils";

export default function DeliverySettingsPage() {
  return (
    <div>
      <PageHeading
        title="Entrega e Pagamento"
        description="Defina onde sua loja entrega e como o cliente poderá pagar"
        action={
          <span className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Salvar alterações
          </span>
        }
      />

      <div className="mb-5 flex gap-5 text-sm">
        {["Regiões de entrega", "Formas de pagamento", "Retirada e consumo local"].map((tab, index) => (
          <span
            key={tab}
            className={index === 0 ? "border-b-2 border-brand pb-2 font-semibold text-brand" : "text-zinc-500"}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-zinc-100 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Regiões atendidas</h2>
              <p className="text-sm text-subtle">Gerencie as regiões onde você entrega seus pedidos.</p>
            </div>
            <span className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-sm font-semibold text-white">
              Nova região
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-subtle">
                <tr>
                  {["Região", "Bairros ou CEPs", "Taxa", "Tempo estimado", "Pedido mínimo", "Status", "Ações"].map(
                    (head) => (
                      <th key={head} className="px-3 py-2 font-medium">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {deliveryRegions.map((region) => (
                  <tr key={region.id} className="border-t border-zinc-100">
                    <td className="px-3 py-3 font-medium">{region.name}</td>
                    <td className="px-3 py-3 text-subtle">{region.areas}</td>
                    <td className="px-3 py-3">{formatCurrency(region.fee)}</td>
                    <td className="px-3 py-3">{region.eta}</td>
                    <td className="px-3 py-3">{formatCurrency(region.minOrder)}</td>
                    <td className="px-3 py-3">
                      <StatusPill value="Ativa" />
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex gap-2 text-zinc-400">
                        <Pencil className="size-4" />
                        <Trash2 className="size-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-subtle">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Os valores de taxa, tempo e pedido mínimo são sugeridos para o cliente no momento do checkout.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-100 p-4">
          <h2 className="font-semibold">Formas aceitas</h2>
          <p className="mb-4 text-sm text-subtle">
            Selecione as formas de pagamento que você aceita na entrega.
          </p>
          <ul className="space-y-3">
            {[
              "Dinheiro",
              "PIX na entrega",
              "Cartão de crédito na entrega",
              "Cartão de débito na entrega",
            ].map((method) => (
              <li key={method} className="flex items-center justify-between text-sm">
                <span>{method}</span>
                <Switch checked aria-label={method} />
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-zinc-100 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Perguntar se precisa de troco</p>
                <p className="text-xs text-subtle">
                  Perguntar ao cliente se ele precisa de troco ao selecionar pagamento em dinheiro.
                </p>
              </div>
              <Switch checked aria-label="Perguntar troco" />
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-orange-50 px-3 py-3 text-sm text-orange-800">
            <span className="font-semibold">Pagamentos são realizados diretamente ao estabelecimento.</span>
            <br />
            Não realizamos cobranças online.
          </p>
        </section>
      </div>
    </div>
  );
}
