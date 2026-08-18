"use client";

import { useEffect, useState } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/admin/status-pill";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";

type Coupon = { id: string; code: string; name: string; type: string; value: number; active: number };

export function LiveCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [metrics, setMetrics] = useState({ active: 0, uses: 0, revenueCents: 0 });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"percent" | "fixed" | "free_delivery">("percent");
  const [value, setValue] = useState("10");

  async function load() {
    const payload = await adminJson<{ coupons: Coupon[]; metrics: typeof metrics }>("/api/mipede/v1/catalog/coupons");
    setCoupons(payload.coupons ?? []);
    setMetrics(payload.metrics ?? { active: 0, uses: 0, revenueCents: 0 });
  }

  useEffect(() => {
    void fetch("/api/mipede/v1/catalog/coupons", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { coupons: [], metrics: { active: 0, uses: 0, revenueCents: 0 } }))
      .then((payload: { coupons?: Coupon[]; metrics?: typeof metrics }) => {
        setCoupons(payload.coupons ?? []);
        setMetrics(payload.metrics ?? { active: 0, uses: 0, revenueCents: 0 });
      });
  }, []);

  return (
    <div>
      <PageHeading
        title="Promoções e Cupons"
        description="Crie incentivos para aumentar a conversão da sua loja"
        action={<Button onClick={() => setOpen(true)}>Novo cupom</Button>}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Cupons ativos" value={String(metrics.active)} />
        <Metric label="Utilizações" value={String(metrics.uses)} />
        <Metric label="Vendas geradas" value={(metrics.revenueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-subtle">
            <tr>
              {["Código", "Nome", "Benefício", "Status", "Ações"].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="font-medium">Nenhum cupom criado</p>
                  <Button className="mt-3" onClick={() => setOpen(true)}>Novo cupom</Button>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.name}</td>
                  <td className="px-4 py-3">{coupon.type === "percent" ? `${coupon.value}%` : coupon.type === "free_delivery" ? "Frete grátis" : (coupon.value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="px-4 py-3"><StatusPill value={coupon.active ? "Ativo" : "Pausado"} /></td>
                  <td className="px-4 py-3">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() =>
                        void adminJson(`/api/mipede/v1/catalog/coupons/${coupon.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ active: !coupon.active }),
                        }).then(load)
                      }
                    >
                      {coupon.active ? "Pausar" : "Reativar"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Novo cupom">
        <div className="space-y-3">
          <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Código" />
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome interno" />
          <select className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
            <option value="percent">Percentual</option>
            <option value="fixed">Valor fixo</option>
            <option value="free_delivery">Frete grátis</option>
          </select>
          <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Valor" />
          <Button
            onClick={() =>
              void adminJson("/api/mipede/v1/catalog/coupons", {
                method: "POST",
                body: JSON.stringify({
                  code,
                  name,
                  type,
                  value: type === "percent" ? Number(value) : moneyFromInput(value),
                }),
              }).then(() => {
                setOpen(false);
                setToast("Cupom criado.");
                return load();
              })
            }
          >
            Criar cupom
          </Button>
        </div>
      </Dialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-zinc-100 bg-white p-4">
      <p className="text-sm text-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}
