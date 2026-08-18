"use client";

import { useEffect, useState } from "react";

import { MediaSlot } from "@/components/admin/media-slot";
import { PageHeading } from "@/components/admin/page-heading";
import { StorefrontPreview } from "@/components/admin/storefront-preview";
import { StorePublicLinkCard } from "@/components/admin/share-store-link";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";

type Identity = {
  logoMediaId?: string | null;
  coverDesktopMediaId?: string | null;
  coverMobileMediaId?: string | null;
  coverDesktopFocusX?: number;
  coverDesktopFocusY?: number;
  coverMobileFocusX?: number;
  coverMobileFocusY?: number;
  logoUrl?: string | null;
  coverDesktopUrl?: string | null;
  coverMobileUrl?: string | null;
};

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
  const [identity, setIdentity] = useState<Identity>({});
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    void fetch("/api/mipede/v1/settings", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { settings?: Record<string, unknown>; identity?: Identity } | null) => {
        if (!payload) return;
        const settings = payload.settings ?? {};
        setName(String(settings.name ?? ""));
        setDescription(String(settings.description ?? ""));
        setWhatsapp(String(settings.whatsapp ?? ""));
        setPhone(String(settings.phone ?? ""));
        setHoursLabel(String(settings.hours_label ?? ""));
        setAddressLine(String(settings.address_line ?? ""));
        setMinOrder(String((Number(settings.min_order_cents ?? 0) / 100).toFixed(2)).replace(".", ","));
        setIsOpen(settings.is_open !== 0);
        setSlug(String(settings.slug ?? ""));
        setIdentity(payload.identity ?? {});
      });
  }, []);

  async function saveInfo() {
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
    setToast("Informações salvas.");
  }

  async function saveIdentity(patch: Record<string, unknown>) {
    const payload = await adminJson<{ identity: Identity }>("/api/mipede/v1/settings/identity", {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    setIdentity(payload.identity);
    setToast("Identidade visual atualizada.");
  }

  return (
    <div>
      <PageHeading
        title="Configuração da Loja"
        description="Personalize as informações e a identidade do seu cardápio"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(true)}>
              Pré-visualizar
            </Button>
            <Button disabled={pending} onClick={() => void saveInfo()}>
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      />

      <section className="mb-6 space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
        <h2 className="font-semibold">Informações da loja</h2>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome fantasia" />
        <textarea className="min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição da loja" />
        <Input value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="Endereço da unidade" />
        <Input value={minOrder} onChange={(event) => setMinOrder(event.target.value)} placeholder="Pedido mínimo" />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={isOpen} onClick={() => setIsOpen((value) => !value)} /> Loja aberta
        </label>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-semibold">Identidade visual</h2>
        <div className="grid gap-4 xl:grid-cols-3">
          <MediaSlot
            label="Logo do estabelecimento"
            hint="Recomendado 600 × 600 px, proporção 1:1."
            aspectClass="aspect-square"
            valueUrl={identity.logoUrl}
            onUploaded={(id, url) => {
              setIdentity((current) => ({ ...current, logoMediaId: id, logoUrl: url }));
              void saveIdentity({ logoMediaId: id });
            }}
            onRemove={() => void saveIdentity({ logoMediaId: null })}
          />
          <MediaSlot
            label="Capa para desktop"
            hint="Recomendado 1920 × 500 px."
            aspectClass="aspect-[1920/500]"
            valueUrl={identity.coverDesktopUrl}
            focus={{ x: identity.coverDesktopFocusX ?? 0.5, y: identity.coverDesktopFocusY ?? 0.5 }}
            onUploaded={(id, url) => {
              setIdentity((current) => ({ ...current, coverDesktopMediaId: id, coverDesktopUrl: url }));
              void saveIdentity({ coverDesktopMediaId: id });
            }}
            onRemove={() => void saveIdentity({ coverDesktopMediaId: null })}
            onFocus={(focus) => {
              setIdentity((current) => ({ ...current, coverDesktopFocusX: focus.x, coverDesktopFocusY: focus.y }));
              void saveIdentity({ coverDesktopFocusX: focus.x, coverDesktopFocusY: focus.y });
            }}
            onRestoreFocus={() => void saveIdentity({ coverDesktopFocusX: 0.5, coverDesktopFocusY: 0.5 })}
          />
          <MediaSlot
            label="Capa para mobile"
            hint="Recomendado 1080 × 600 px."
            aspectClass="aspect-[1080/600]"
            valueUrl={identity.coverMobileUrl}
            focus={{ x: identity.coverMobileFocusX ?? 0.5, y: identity.coverMobileFocusY ?? 0.5 }}
            onUploaded={(id, url) => {
              setIdentity((current) => ({ ...current, coverMobileMediaId: id, coverMobileUrl: url }));
              void saveIdentity({ coverMobileMediaId: id });
            }}
            onRemove={() => void saveIdentity({ coverMobileMediaId: null })}
            onFocus={(focus) => {
              setIdentity((current) => ({ ...current, coverMobileFocusX: focus.x, coverMobileFocusY: focus.y }));
              void saveIdentity({ coverMobileFocusX: focus.x, coverMobileFocusY: focus.y });
            }}
            onRestoreFocus={() => void saveIdentity({ coverMobileFocusX: 0.5, coverMobileFocusY: 0.5 })}
          />
        </div>
      </section>

      <section className="mb-6 space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
        <h2 className="font-semibold">Contato e funcionamento</h2>
        <Input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="WhatsApp" />
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefone (opcional)" />
        <Input value={hoursLabel} onChange={(event) => setHoursLabel(event.target.value)} placeholder="Horário de funcionamento" />
        <p className="text-sm text-subtle">
          Slug público: <strong>/{slug}</strong> — alteração restrita para preservar o link permanente.
        </p>
      </section>

      <StorePublicLinkCard />
      <a href={`/loja/${slug}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm font-semibold">
        Visualizar cardápio
      </a>

      <Dialog open={preview} onClose={() => setPreview(false)} title="Pré-visualizar cardápio" className="sm:max-w-4xl">
        <StorefrontPreview
          storeName={name}
          isOpen={isOpen}
          identity={identity}
        />
      </Dialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
