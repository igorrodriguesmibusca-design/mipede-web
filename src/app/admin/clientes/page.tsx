import { Download, Eye, MoreVertical, Repeat, Search, Ticket, UserPlus, Users } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Pagination } from "@/components/admin/pagination";
import { StatCard } from "@/components/admin/stat-card";
import { customerStats, customers } from "@/data/mock-customers";
import { cn, formatCurrency } from "@/lib/utils";

const originClass: Record<string, string> = {
  "Instagram orgânico": "bg-violet-50 text-violet-600",
  "Meta Ads": "bg-sky-50 text-sky-600",
  WhatsApp: "bg-emerald-50 text-emerald-600",
  Direto: "bg-zinc-100 text-zinc-500",
};

const avatarTone: Record<string, string> = {
  rose: "bg-rose-100 text-rose-600",
  green: "bg-emerald-100 text-emerald-600",
  blue: "bg-sky-100 text-sky-600",
  slate: "bg-zinc-100 text-zinc-600",
  amber: "bg-amber-100 text-amber-600",
};

export default function CustomersPage() {
  return (
    <div>
      <PageHeading
        title="Clientes"
        description="Conheça quem compra na sua loja"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de clientes" value={String(customerStats.total)} icon={Users} tone="rose" />
        <StatCard label="Novos clientes" value={String(customerStats.newCustomers)} icon={UserPlus} tone="green" />
        <StatCard label="Clientes recorrentes" value={String(customerStats.recurring)} icon={Repeat} />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(customerStats.averageTicket)}
          icon={Ticket}
          tone="amber"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-100">
        <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar cliente</span>
            <Search className="absolute top-3.5 left-3 size-4 text-zinc-400" />
            <input
              readOnly
              placeholder="Buscar por nome ou WhatsApp"
              className="h-11 w-full rounded-xl border border-zinc-200 pr-3 pl-9 text-sm"
            />
          </label>
          <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm">
            <option>Todos os clientes</option>
          </select>
          <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm">
            <option>Última compra</option>
          </select>
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand px-3 text-sm font-semibold text-brand">
            <Download className="size-4" />
            Exportar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-subtle">
              <tr>
                {["Cliente", "WhatsApp", "Pedidos", "Total gasto", "Ticket médio", "Endereços", "Status", "Última compra", "Origem", "Ações"].map(
                  (head) => (
                    <th key={head} className="px-4 py-3 font-medium">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                          avatarTone[customer.tone],
                        )}
                      >
                        {customer.initials}
                      </span>
                      {customer.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3">{formatCurrency(customer.spent)}</td>
                  <td className="px-4 py-3">{formatCurrency(customer.ticket)}</td>
                  <td className="px-4 py-3">{customer.addressCount}</td>
                  <td className="px-4 py-3">{customer.status}</td>
                  <td className="px-4 py-3">{customer.lastPurchase}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", originClass[customer.origin])}>
                      {customer.origin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-2 text-zinc-400">
                      <Eye className="size-4" />
                      <MoreVertical className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="Mostrando 1 a 8 de 42 clientes" pages={[1, 2, 3, 4, 5]} />
      </div>
    </div>
  );
}
