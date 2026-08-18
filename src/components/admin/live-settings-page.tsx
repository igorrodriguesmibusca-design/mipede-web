"use client";

import { useEffect, useState } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { StorePublicLinkCard } from "@/components/admin/share-store-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";

export function LiveSettingsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [hoursLabel, setHoursLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [isOpen, setIsOpen] = useState(true);
  const [slug, setSlug] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void adminJson<{ settings: Record<string, unknown> }>("/api/mipede/v1/settings").then((payload) => {
      const settings = payload.settings ?? {};
      setName(String(settings.name ?? ""));
      setDescription(String(settings.description ?? ""));
      setWhatsapp(String(settings.whatsapp ?? ""));
      setPhone(String(settings.phone ?? ""));
      setHoursLabel(String(settings.hours_label ?? ""));
      setAddressLine(String(settings.address_line ?? ""));
      setMinOrder(String(((Number(settings.min_order_cents ?? 0)) / 100).toFixed(2)).replace(".", ","));
      setIsOpen(settings.is_open !== 0);
      setSlug(String(settings.slug ?? ""));
    });
  }, []);

  async function save() {
    setPending(true);
    await adminJson("/api/mipede/v1/settings", {
      method: "PUT",
      body: JSON.stringify({
        name,
        description,
        whatsapp,
        phone,
        hoursLabel,
        addressLine,
        minOrderCents: moneyFromInput(minOrder),
        isOpen,
      }),
    });
    setPending(false);
    setToast("Alterações salvas.");
  }

  return (
    <div>
      <PageHeading
        title="Configuração da Loja"
        description="Personalize as informações exibidas no seu cardápio"
        action={
          <Button disabled={pending} onClick={() => void save()}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome fantasia" />
          <textarea className="min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição da loja" />
          <Input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="WhatsApp" />
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefone (opcional)" />
          <Input value={hoursLabel} onChange={(event) => setHoursLabel(event.target.value)} placeholder="Horário de funcionamento" />
          <Input value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="Endereço da unidade" />
          <Input value={minOrder} onChange={(event) => setMinOrder(event.target.value)} placeholder="Pedido mínimo" />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isOpen} onClick={() => setIsOpen((value) => !value)} /> Loja aberta
          </label>
          <p className="text-sm text-subtle">Slug público: <strong>/{slug}</strong> — alteração restrita para preservar o link permanente.</p>
        </section>
        <div className="space-y-4">
          <StorePublicLinkCard />
          <a href={`/loja/${slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm font-semibold">
            Visualizar cardápio
          </a>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
