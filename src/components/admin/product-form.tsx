"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { addonGroups, categories } from "@/data/mock-products";
import { routes } from "@/lib/routes";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function ProductForm() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [promo, setPromo] = useState("");
  const [cost, setCost] = useState("");
  const [active, setActive] = useState(true);
  const [soldOut, setSoldOut] = useState(false);
  const [availability, setAvailability] = useState("sempre");
  const [days, setDays] = useState(weekDays);
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("23:00");
  const [featured, setFeatured] = useState(false);
  const [notes, setNotes] = useState(true);
  const [order, setOrder] = useState("1");
  const [prep, setPrep] = useState("20");
  const [groups, setGroups] = useState<string[]>(["bordas"]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Informe o nome do produto.";
    if (!category) next.category = "Selecione uma categoria.";
    if (!price || Number(price) <= 0) next.price = "Informe um preço válido.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function finish(message: string) {
    if (!validate()) return;
    setToast(message);
    window.setTimeout(() => router.push(routes.admin.products), 900);
  }

  return (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <section className="rounded-2xl border border-zinc-100 p-5">
        <h2 className="mb-4 font-semibold">Informações principais</h2>
        <div className="grid gap-5 md:grid-cols-[200px_1fr]">
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-subtle">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus className="mb-2 size-6" />
                Enviar imagem
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          <div className="space-y-4">
            <Field label="Nome do produto *" error={errors.name}>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label="Descrição">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-24 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria *" error={errors.category}>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
                >
                  <option value="">Selecione</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Código interno">
                <Input value={code} onChange={(event) => setCode(event.target.value)} />
              </Field>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-100 p-5">
        <h2 className="mb-4 font-semibold">Preços</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Preço de venda *" error={errors.price}>
            <Input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0,00" />
          </Field>
          <Field label="Preço promocional">
            <Input value={promo} onChange={(event) => setPromo(event.target.value)} />
          </Field>
          <Field label="Custo interno">
            <Input value={cost} onChange={(event) => setCost(event.target.value)} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-subtle">O custo interno não aparece para o consumidor.</p>
      </section>

      <section className="rounded-2xl border border-zinc-100 p-5">
        <h2 className="mb-4 font-semibold">Disponibilidade</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="Produto ativo" checked={active} onToggle={() => setActive((value) => !value)} />
          <Toggle label="Produto esgotado" checked={soldOut} onToggle={() => setSoldOut((value) => !value)} />
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium">Agenda</span>
          <select
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
            className="h-11 w-full max-w-xs rounded-xl border border-zinc-200 px-3 text-sm"
          >
            <option value="sempre">Sempre disponível</option>
            <option value="horario">Horário programado</option>
          </select>
        </label>
        {availability === "horario" ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const on = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setDays((current) =>
                        on ? current.filter((item) => item !== day) : [...current, day],
                      )
                    }
                    className={
                      on
                        ? "rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white"
                        : "rounded-lg bg-zinc-100 px-2.5 py-1 text-xs"
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="grid max-w-sm grid-cols-2 gap-3">
              <Input type="time" value={start} onChange={(event) => setStart(event.target.value)} />
              <Input type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-zinc-100 p-5">
        <h2 className="mb-4 font-semibold">Complementos</h2>
        <ul className="space-y-2">
          {addonGroups.map((group) => {
            const selected = groups.includes(group.id);
            return (
              <li key={group.id} className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">{group.name}</p>
                  <p className="text-xs text-subtle">
                    Mín. {group.min} · Máx. {group.max} · {group.required ? "Obrigatório" : "Opcional"}
                  </p>
                </div>
                <Switch
                  checked={selected}
                  aria-label={group.name}
                  onClick={() =>
                    setGroups((current) =>
                      selected ? current.filter((id) => id !== group.id) : [...current, group.id],
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-100 p-5">
        <h2 className="mb-4 font-semibold">Configurações adicionais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="Produto em destaque" checked={featured} onToggle={() => setFeatured((value) => !value)} />
          <Toggle label="Permitir observações" checked={notes} onToggle={() => setNotes((value) => !value)} />
          <Field label="Ordem de exibição">
            <Input value={order} onChange={(event) => setOrder(event.target.value)} />
          </Field>
          <Field label="Tempo estimado de preparo (min)">
            <Input value={prep} onChange={(event) => setPrep(event.target.value)} />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push(routes.admin.products)}
          className="h-10 rounded-xl border border-zinc-200 px-4 text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => finish("Produto salvo como rascunho.")}
          className="h-10 rounded-xl border border-brand px-4 text-sm font-semibold text-brand"
        >
          Salvar como rascunho
        </button>
        <button
          type="button"
          onClick={() => finish("Produto publicado.")}
          className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
        >
          Publicar produto
        </button>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} aria-label={label} onClick={onToggle} />
    </div>
  );
}
