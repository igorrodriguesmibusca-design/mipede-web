"use client";

import { useEffect, useMemo, useState } from "react";

import { MediaSlot } from "@/components/admin/media-slot";
import { PageHeading } from "@/components/admin/page-heading";
import { StorefrontPreview } from "@/components/admin/storefront-preview";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/admin/status-pill";
import { Toast } from "@/components/ui/toast";
import { adminJson } from "@/lib/admin-api";
import { validateBannerInput } from "@/lib/storefront-banners";

type Banner = {
  id: string;
  internalName: string;
  desktopUrl?: string | null;
  mobileUrl?: string | null;
  desktopMediaId?: string | null;
  mobileMediaId?: string | null;
  altText?: string | null;
  placement: "hero" | "after_category" | "footer";
  afterCategoryId?: string | null;
  targetType: "none" | "product" | "category" | "coupon" | "external";
  targetId?: string | null;
  externalUrl?: string | null;
  ctaLabel?: string | null;
  deviceScope: "both" | "desktop" | "mobile";
  sortOrder: number;
  status: "draft" | "active" | "paused";
  startsAt?: number | null;
  endsAt?: number | null;
  displayStatus: string;
};

type Draft = {
  id?: string;
  internalName: string;
  desktopMediaId: string | null;
  mobileMediaId: string | null;
  desktopUrl?: string | null;
  mobileUrl?: string | null;
  altText: string;
  placement: Banner["placement"];
  afterCategoryId: string;
  targetType: Banner["targetType"];
  targetId: string;
  externalUrl: string;
  ctaLabel: string;
  deviceScope: Banner["deviceScope"];
  status: Banner["status"];
  startsAt: string;
  endsAt: string;
};

const emptyDraft = (): Draft => ({
  internalName: "",
  desktopMediaId: null,
  mobileMediaId: null,
  altText: "",
  placement: "hero",
  afterCategoryId: "",
  targetType: "none",
  targetId: "",
  externalUrl: "",
  ctaLabel: "",
  deviceScope: "both",
  status: "draft",
  startsAt: "",
  endsAt: "",
});

export function LiveBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [options, setOptions] = useState<{ categories: Array<{ id: string; name: string; active: number }>; products: Array<{ id: string; name: string }>; coupons: Array<{ id: string; name: string }> }>({
    categories: [],
    products: [],
    coupons: [],
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [filter, setFilter] = useState("all");
  const [toDelete, setToDelete] = useState<string | null>(null);

  async function load() {
    const payload = await adminJson<{ banners: Banner[] }>("/api/mipede/v1/catalog/banners");
    setBanners(payload.banners ?? []);
  }

  useEffect(() => {
    void fetch("/api/mipede/v1/catalog/banners", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { banners: [] }))
      .then((payload: { banners?: Banner[] }) => setBanners(payload.banners ?? []));
    void fetch("/api/mipede/v1/catalog/banners/options", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : {}))
      .then((payload: { categories?: Array<{ id: string; name: string; active: number }>; products?: Array<{ id: string; name: string }>; coupons?: Array<{ id: string; name: string }> }) =>
        setOptions({ categories: payload.categories ?? [], products: payload.products ?? [], coupons: payload.coupons ?? [] }),
      );
  }, []);

  async function move(banner: Banner, direction: -1 | 1) {
    const same = banners.filter((item) => item.placement === banner.placement);
    const index = same.findIndex((item) => item.id === banner.id);
    const swap = same[index + direction];
    if (!swap) return;
    const ids = same.map((item) => item.id);
    const current = ids[index];
    ids[index] = ids[index + direction] ?? current;
    ids[index + direction] = current;
    await adminJson("/api/mipede/v1/catalog/banners/reorder", { method: "POST", body: JSON.stringify({ ids }) });
    await load();
  }

  const visible = banners.filter((banner) => filter === "all" || banner.displayStatus === filter);

  function toPayload(value: Draft) {
    return {
      internalName: value.internalName,
      desktopMediaId: value.desktopMediaId,
      mobileMediaId: value.mobileMediaId,
      altText: value.altText || null,
      placement: value.placement,
      afterCategoryId: value.placement === "after_category" ? value.afterCategoryId || null : null,
      targetType: value.targetType,
      targetId: value.targetType === "external" || value.targetType === "none" ? null : value.targetId || null,
      externalUrl: value.targetType === "external" ? value.externalUrl : null,
      ctaLabel: value.ctaLabel || null,
      deviceScope: value.deviceScope,
      status: value.status,
      startsAt: value.startsAt ? new Date(value.startsAt).getTime() : null,
      endsAt: value.endsAt ? new Date(value.endsAt).getTime() : null,
    };
  }

  async function save() {
    if (!draft) return;
    const payload = toPayload(draft);
    const invalid = validateBannerInput(payload);
    if (invalid) {
      setError(invalid.message);
      return;
    }
    setError(null);
    if (draft.id) {
      await adminJson(`/api/mipede/v1/catalog/banners/${draft.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await adminJson("/api/mipede/v1/catalog/banners", { method: "POST", body: JSON.stringify(payload) });
    }
    setDraft(null);
    setToast("Banner salvo.");
    await load();
  }

  const placementLabel = useMemo(
    () => ({ hero: "Destaque principal", after_category: "Depois de uma categoria", footer: "Final do cardápio" }),
    [],
  );

  return (
    <div>
      <PageHeading
        title="Banners do Cardápio"
        description="Crie destaques promocionais e escolha onde eles aparecem no seu cardápio"
        action={<Button onClick={() => setDraft(emptyDraft())}>Novo banner</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "Em exibição", "Rascunho", "Agendado", "Pausado", "Encerrado", "Precisa de ajuste"].map((item) => (
          <button key={item} type="button" className={`rounded-full px-3 py-1 text-sm ${filter === item ? "bg-brand text-white" : "border border-zinc-200"}`} onClick={() => setFilter(item)}>
            {item === "all" ? "Todos" : item}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-subtle">
            <tr>
              {["Banner", "Posição", "Destino", "Status", "Ações"].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="font-medium">Nenhum banner criado</p>
                  <Button className="mt-3" onClick={() => setDraft(emptyDraft())}>Criar primeiro banner</Button>
                </td>
              </tr>
            ) : (
              visible.map((banner) => (
                <tr key={banner.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {banner.desktopUrl || banner.mobileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={banner.desktopUrl || banner.mobileUrl || ""} alt="" className="h-10 w-16 rounded-lg object-cover" />
                      ) : <span className="h-10 w-16 rounded-lg bg-zinc-100" />}
                      <span className="font-medium">{banner.internalName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{placementLabel[banner.placement]}</td>
                  <td className="px-4 py-3">{banner.targetType}</td>
                  <td className="px-4 py-3"><StatusPill value={banner.displayStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="xs" variant="outline" onClick={() => void move(banner, -1)}>Subir</Button>
                      <Button size="xs" variant="outline" onClick={() => void move(banner, 1)}>Descer</Button>
                      <Button size="xs" variant="outline" onClick={() => setDraft(fromBanner(banner))}>Editar</Button>
                      <Button size="xs" variant="outline" onClick={() => void adminJson(`/api/mipede/v1/catalog/banners/${banner.id}`, { method: "PATCH", body: JSON.stringify({ status: banner.status === "active" ? "paused" : "active" }) }).then(load)}>
                        {banner.status === "active" ? "Pausar" : "Ativar"}
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => void adminJson(`/api/mipede/v1/catalog/banners/${banner.id}/duplicate`, { method: "POST" }).then(load)}>Duplicar</Button>
                      <Button size="xs" variant="outline" onClick={() => setPreview(true)}>Pré-visualizar</Button>
                      <Button size="xs" variant="ghost" onClick={() => setToDelete(banner.id)}>Excluir</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? "Editar banner" : "Novo banner"} className="sm:max-w-3xl">
        {draft ? (
          <div className="space-y-4">
            <Input value={draft.internalName} onChange={(event) => setDraft({ ...draft, internalName: event.target.value })} placeholder="Nome interno" />
            <div className="grid gap-3 md:grid-cols-2">
              <MediaSlot
                label="Imagem desktop"
                hint="Recomendado 1600 × 400 px, proporção 4:1."
                aspectClass="aspect-[4/1]"
                valueUrl={draft.desktopUrl}
                onUploaded={(id, url) => setDraft({ ...draft, desktopMediaId: id, desktopUrl: url })}
                onRemove={() => setDraft({ ...draft, desktopMediaId: null, desktopUrl: null })}
              />
              <MediaSlot
                label="Imagem mobile"
                hint="Recomendado 1080 × 540 px, proporção 2:1."
                aspectClass="aspect-[2/1]"
                valueUrl={draft.mobileUrl}
                onUploaded={(id, url) => setDraft({ ...draft, mobileMediaId: id, mobileUrl: url })}
                onRemove={() => setDraft({ ...draft, mobileMediaId: null, mobileUrl: null })}
              />
            </div>
            <Input value={draft.altText} onChange={(event) => setDraft({ ...draft, altText: event.target.value })} placeholder="Texto alternativo" />
            <label className="block text-sm font-medium">
              Posição no cardápio
              <select className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={draft.placement} onChange={(event) => setDraft({ ...draft, placement: event.target.value as Draft["placement"] })}>
                <option value="hero">Destaque principal</option>
                <option value="after_category">Depois de uma categoria</option>
                <option value="footer">Final do cardápio</option>
              </select>
            </label>
            <PlacementMap placement={draft.placement} />
            {draft.placement === "after_category" ? (
              <select className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={draft.afterCategoryId} onChange={(event) => setDraft({ ...draft, afterCategoryId: event.target.value })}>
                <option value="">Selecione a categoria</option>
                {options.categories.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativa)"}</option>)}
              </select>
            ) : null}
            <label className="block text-sm font-medium">
              Destino do clique
              <select className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={draft.targetType} onChange={(event) => setDraft({ ...draft, targetType: event.target.value as Draft["targetType"] })}>
                <option value="none">Nenhum</option>
                <option value="product">Produto</option>
                <option value="category">Categoria</option>
                <option value="coupon">Cupom</option>
                <option value="external">Link externo</option>
              </select>
            </label>
            {draft.targetType === "product" ? (
              <select className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={draft.targetId} onChange={(event) => setDraft({ ...draft, targetId: event.target.value })}>
                <option value="">Selecione o produto</option>
                {options.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            ) : null}
            {draft.targetType === "category" ? (
              <select className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={draft.targetId} onChange={(event) => setDraft({ ...draft, targetId: event.target.value })}>
                <option value="">Selecione a categoria</option>
                {options.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            ) : null}
            {draft.targetType === "coupon" ? (
              <select className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={draft.targetId} onChange={(event) => setDraft({ ...draft, targetId: event.target.value })}>
                <option value="">Selecione o cupom</option>
                {options.coupons.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            ) : null}
            {draft.targetType === "external" ? (
              <Input value={draft.externalUrl} onChange={(event) => setDraft({ ...draft, externalUrl: event.target.value })} placeholder="https://" />
            ) : null}
            <Input value={draft.ctaLabel} onChange={(event) => setDraft({ ...draft, ctaLabel: event.target.value })} placeholder="Texto do botão (opcional)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Início <Input type="datetime-local" value={draft.startsAt} onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })} /></label>
              <label className="text-sm">Fim <Input type="datetime-local" value={draft.endsAt} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} /></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm" value={draft.deviceScope} onChange={(event) => setDraft({ ...draft, deviceScope: event.target.value as Draft["deviceScope"] })}>
                <option value="both">Desktop e mobile</option>
                <option value="desktop">Somente desktop</option>
                <option value="mobile">Somente mobile</option>
              </select>
              <select className="h-11 rounded-xl border border-zinc-200 px-3 text-sm" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Draft["status"] })}>
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
              </select>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-2">
              <Button onClick={() => void save()}>Salvar banner</Button>
              <Button variant="outline" onClick={() => setPreview(true)}>Pré-visualizar</Button>
            </div>
          </div>
        ) : null}
      </Dialog>
      <Dialog open={preview} onClose={() => setPreview(false)} title="Pré-visualizar composição" className="sm:max-w-4xl">
        <StorefrontPreview storeName="Sua loja" isOpen identity={{}} banners={banners} />
      </Dialog>
      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Excluir banner">
        <p className="text-sm text-subtle">O banner será arquivado e deixará de aparecer no cardápio.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!toDelete) return;
              void adminJson(`/api/mipede/v1/catalog/banners/${toDelete}/archive`, { method: "POST" }).then(() => {
                setToDelete(null);
                return load();
              });
            }}
          >
            Arquivar
          </Button>
        </div>
      </Dialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function fromBanner(banner: Banner): Draft {
  return {
    id: banner.id,
    internalName: banner.internalName,
    desktopMediaId: banner.desktopMediaId ?? null,
    mobileMediaId: banner.mobileMediaId ?? null,
    desktopUrl: banner.desktopUrl,
    mobileUrl: banner.mobileUrl,
    altText: banner.altText ?? "",
    placement: banner.placement,
    afterCategoryId: banner.afterCategoryId ?? "",
    targetType: banner.targetType,
    targetId: banner.targetId ?? "",
    externalUrl: banner.externalUrl ?? "",
    ctaLabel: banner.ctaLabel ?? "",
    deviceScope: banner.deviceScope,
    status: banner.status,
    startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : "",
    endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : "",
  };
}

function PlacementMap({ placement }: { placement: Draft["placement"] }) {
  const items = [
    { id: "header", label: "Capa e informações da loja" },
    { id: "hero", label: "Destaque principal" },
    { id: "categories", label: "Categorias e produtos" },
    { id: "after_category", label: "Banner entre categorias" },
    { id: "footer", label: "Banner final" },
  ];
  return (
    <ol className="space-y-1 rounded-xl bg-zinc-50 p-3 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.id === placement ? "font-semibold text-brand" : "text-subtle"}>
          {item.label}
        </li>
      ))}
    </ol>
  );
}
