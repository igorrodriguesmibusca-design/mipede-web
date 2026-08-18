"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { adminJson, moneyFromInput } from "@/lib/admin-api";
import { routes } from "@/lib/routes";

export function LiveProductForm() {
  const router = useRouter();
  const search = useSearchParams();
  const editingId = search.get("id");
  const [toast, setToast] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [promo, setPromo] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [linked, setLinked] = useState<string[]>([]);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void adminJson<{ categories: Array<{ id: string; name: string }> }>("/api/mipede/v1/catalog/categories").then((payload) =>
      setCategories(payload.categories ?? []),
    );
    void adminJson<{ groups: Array<{ id: string; name: string }> }>("/api/mipede/v1/catalog/complements").then((payload) =>
      setGroups(payload.groups ?? []),
    );
  }, []);

  async function upload(file: File) {
    const body = new FormData();
    body.append("file", file);
    const payload = await adminJson<{ key: string; url: string }>("/api/mipede/v1/media", { method: "POST", body });
    setImageKey(payload.key);
    setPreview(payload.url);
  }

  async function save() {
    if (!name.trim() || !categoryId) {
      setError("Informe nome e categoria.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const payload = {
        name,
        description,
        categoryId,
        priceCents: moneyFromInput(price),
        promoPriceCents: promo ? moneyFromInput(promo) : null,
        imageKey,
        active,
        featured,
        complementGroupIds: linked,
      };
      if (editingId) {
        await adminJson(`/api/mipede/v1/catalog/products/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await adminJson("/api/mipede/v1/catalog/products", { method: "POST", body: JSON.stringify(payload) });
      }
      setToast("Produto salvo.");
      router.push(routes.admin.products);
      router.refresh();
    } catch (item) {
      setError(item instanceof Error ? item.message : "Não foi possível salvar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <section className="rounded-2xl border border-zinc-100 bg-white p-5">
        <h2 className="mb-4 font-semibold">Informações principais</h2>
        <div className="grid gap-5 md:grid-cols-[200px_1fr]">
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-subtle">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <><ImagePlus className="mb-2 size-6" />Enviar imagem</>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
          </label>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Nome do produto *
              <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">Descrição
              <textarea className="mt-1 min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">Categoria *
              <select className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">Selecione</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">Preço *
                <Input className="mt-1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0,00" />
              </label>
              <label className="block text-sm font-medium">Preço promocional
                <Input className="mt-1" value={promo} onChange={(event) => setPromo(event.target.value)} />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onClick={() => setActive((value) => !value)} /> Disponível
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={featured} onClick={() => setFeatured((value) => !value)} /> Destaque
            </label>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-zinc-100 bg-white p-5">
        <h2 className="mb-3 font-semibold">Grupos de complementos</h2>
        <div className="space-y-2">
          {groups.length === 0 ? <p className="text-sm text-subtle">Nenhum grupo criado ainda.</p> : null}
          {groups.map((group) => (
            <label key={group.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={linked.includes(group.id)}
                onChange={(event) => setLinked((current) => event.target.checked ? [...current, group.id] : current.filter((id) => id !== group.id))}
              />
              {group.name}
            </label>
          ))}
        </div>
      </section>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="button" disabled={pending} onClick={() => void save()} className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar produto"}
      </button>
      <Toast message={toast} onDone={() => setToast(null)} />
    </form>
  );
}
