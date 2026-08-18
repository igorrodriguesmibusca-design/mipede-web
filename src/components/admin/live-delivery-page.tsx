"use client";

import { useEffect, useState } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";

export function LiveDeliveryPage() {
  const [deliveryOwn, setDeliveryOwn] = useState(true);
  const [pickup, setPickup] = useState(true);
  const [dineIn, setDineIn] = useState(false);
  const [fee, setFee] = useState("0");
  const [eta, setEta] = useState("40");
  const [minOrder, setMinOrder] = useState("0");
  const [free, setFree] = useState("");
  const [area, setArea] = useState("");
  const [payCash, setPayCash] = useState(true);
  const [payPix, setPayPix] = useState(true);
  const [payDebit, setPayDebit] = useState(false);
  const [payCredit, setPayCredit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void adminJson<{ settings: Record<string, unknown> }>("/api/mipede/v1/settings/delivery").then((payload) => {
      const settings = payload.settings ?? {};
      setDeliveryOwn(settings.delivery_own !== 0);
      setPickup(settings.pickup !== 0);
      setDineIn(settings.dine_in === 1);
      setFee(String(((Number(settings.delivery_fee_cents ?? 0)) / 100).toFixed(2)).replace(".", ","));
      setEta(String(settings.eta_minutes ?? 40));
      setMinOrder(String(((Number(settings.min_order_cents ?? 0)) / 100).toFixed(2)).replace(".", ","));
      setFree(settings.free_delivery_cents ? String(Number(settings.free_delivery_cents) / 100) : "");
      setArea(String(settings.delivery_area ?? ""));
      setPayCash(settings.pay_cash !== 0);
      setPayPix(settings.pay_pix !== 0);
      setPayDebit(settings.pay_debit === 1);
      setPayCredit(settings.pay_credit === 1);
    });
  }, []);

  async function save() {
    await adminJson("/api/mipede/v1/settings/delivery", {
      method: "PUT",
      body: JSON.stringify({
        deliveryOwn,
        pickup,
        dineIn,
        deliveryFeeCents: moneyFromInput(fee),
        etaMinutes: Number(eta) || 40,
        minOrderCents: moneyFromInput(minOrder),
        freeDeliveryCents: free ? moneyFromInput(free) : null,
        deliveryArea: area,
        payCash,
        payPix,
        payDebit,
        payCredit,
      }),
    });
    setToast("Entrega e pagamento salvos.");
  }

  return (
    <div>
      <PageHeading
        title="Entrega e Pagamento"
        description="Defina onde sua loja entrega e como o cliente poderá pagar"
        action={<Button onClick={() => void save()}>Salvar alterações</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
          <h2 className="font-semibold">Modalidades</h2>
          <Toggle label="Entrega própria" checked={deliveryOwn} onToggle={() => setDeliveryOwn((value) => !value)} />
          <Toggle label="Retirada no estabelecimento" checked={pickup} onToggle={() => setPickup((value) => !value)} />
          <Toggle label="Consumir no local" checked={dineIn} onToggle={() => setDineIn((value) => !value)} />
          <Input value={fee} onChange={(event) => setFee(event.target.value)} placeholder="Taxa de entrega" />
          <Input value={eta} onChange={(event) => setEta(event.target.value)} placeholder="Prazo estimado (min)" />
          <Input value={minOrder} onChange={(event) => setMinOrder(event.target.value)} placeholder="Pedido mínimo" />
          <Input value={free} onChange={(event) => setFree(event.target.value)} placeholder="Frete grátis acima de" />
          <textarea className="min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Regiões e bairros atendidos" />
        </section>
        <section className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
          <h2 className="font-semibold">Pagamento na entrega</h2>
          <Toggle label="Dinheiro" checked={payCash} onToggle={() => setPayCash((value) => !value)} />
          <Toggle label="PIX" checked={payPix} onToggle={() => setPayPix((value) => !value)} />
          <Toggle label="Cartão de débito" checked={payDebit} onToggle={() => setPayDebit((value) => !value)} />
          <Toggle label="Cartão de crédito" checked={payCredit} onToggle={() => setPayCredit((value) => !value)} />
          <p className="text-sm text-subtle">Não coletamos dados de cartão. O pagamento acontece direto com a loja.</p>
        </section>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function Toggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <Switch checked={checked} onClick={onToggle} />
    </label>
  );
}
