"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";
import { isValidSlug } from "@/server/roles";

const STEPS = [
  { href: routes.onboarding.company, label: "Empresa" },
  { href: routes.onboarding.operation, label: "Operação" },
  { href: routes.onboarding.identity, label: "Identidade" },
  { href: routes.onboarding.review, label: "Revisão" },
] as const;

type Draft = {
  name: string;
  segment: string;
  whatsapp: string;
  responsible: string;
  cnpj: string;
  city: string;
  state: string;
  slug: string;
  deliveryOwn: boolean;
  pickup: boolean;
  dineIn: boolean;
  hoursLabel: string;
  prepMinutes: number;
  minOrder: number;
  payments: Array<"DINHEIRO" | "PIX" | "CARTAO">;
  deliveryArea: string;
  description: string;
  primaryColor: string;
};

const EMPTY: Draft = {
  name: "",
  segment: "Pizzaria",
  whatsapp: "",
  responsible: "",
  cnpj: "",
  city: "",
  state: "SP",
  slug: "",
  deliveryOwn: true,
  pickup: true,
  dineIn: false,
  hoursLabel: "18h às 23h",
  prepMinutes: 40,
  minOrder: 0,
  payments: ["PIX", "CARTAO"],
  deliveryArea: "",
  description: "",
  primaryColor: "#FF5C00",
};

function loadDraft(): Draft {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = sessionStorage.getItem("mipede_onboarding_draft");
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Draft) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveDraft(draft: Draft) {
  sessionStorage.setItem("mipede_onboarding_draft", JSON.stringify(draft));
}

export function OnboardingShell({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <p className="text-sm font-medium text-brand">Onboarding {step} de 4</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <ol className="mt-4 flex gap-2 text-xs text-subtle">
          {STEPS.map((item, index) => (
            <li key={item.href} className={index + 1 === step ? "font-semibold text-ink" : undefined}>
              {item.label}
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5">{children}</div>
      </div>
    </div>
  );
}

export function CompanyStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function next() {
    if (pending) return;
    saveDraft(draft);
    if (!isValidSlug(draft.slug)) {
      setError("Este slug não pode ser usado.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/mipede/v1/onboarding/company", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: draft.name,
        segment: draft.segment,
        whatsapp: draft.whatsapp,
        responsible: draft.responsible,
        cnpj: draft.cnpj || undefined,
        city: draft.city,
        state: draft.state,
        slug: draft.slug,
      }),
    });
    if (response.status === 503) {
      router.push(routes.onboarding.operation);
      return;
    }
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setPending(false);
      setError(
        payload.error === "reserved_or_invalid_slug" || payload.error === "slug_taken"
          ? "Este slug não pode ser usado."
          : "Revise os dados da empresa.",
      );
      return;
    }
    router.push(routes.onboarding.operation);
  }

  return (
    <OnboardingShell step={1} title="Dados da empresa">
      <div className="grid gap-4">
        <Field label="Nome do estabelecimento">
          <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </Field>
        <Field label="Segmento">
          <Input value={draft.segment} onChange={(event) => setDraft({ ...draft, segment: event.target.value })} />
        </Field>
        <Field label="WhatsApp comercial">
          <Input value={draft.whatsapp} onChange={(event) => setDraft({ ...draft, whatsapp: event.target.value })} />
        </Field>
        <Field label="Responsável">
          <Input value={draft.responsible} onChange={(event) => setDraft({ ...draft, responsible: event.target.value })} />
        </Field>
        <Field label="CNPJ (opcional)">
          <Input value={draft.cnpj} onChange={(event) => setDraft({ ...draft, cnpj: event.target.value })} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Cidade" className="col-span-2">
            <Input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
          </Field>
          <Field label="UF">
            <Input maxLength={2} value={draft.state} onChange={(event) => setDraft({ ...draft, state: event.target.value.toUpperCase() })} />
          </Field>
        </div>
        <Field label="Slug desejado">
          <Input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase() })} />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="button" className="h-11 rounded-xl" disabled={pending} onClick={() => void next()}>
          {pending ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </OnboardingShell>
  );
}

export function OperationStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(loadDraft);

  async function next() {
    saveDraft(draft);
    await fetch("/api/mipede/v1/onboarding/operation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        deliveryOwn: draft.deliveryOwn,
        pickup: draft.pickup,
        dineIn: draft.dineIn,
        hoursLabel: draft.hoursLabel,
        prepMinutes: draft.prepMinutes,
        minOrder: draft.minOrder,
        payments: draft.payments,
        deliveryArea: draft.deliveryArea,
      }),
    });
    router.push(routes.onboarding.identity);
  }

  return (
    <OnboardingShell step={2} title="Operação">
      <div className="grid gap-4">
        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={draft.deliveryOwn} onChange={(event) => setDraft({ ...draft, deliveryOwn: event.target.checked })} />
          Entrega própria
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={draft.pickup} onChange={(event) => setDraft({ ...draft, pickup: event.target.checked })} />
          Retirada
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={draft.dineIn} onChange={(event) => setDraft({ ...draft, dineIn: event.target.checked })} />
          Consumo no local
        </label>
        <Field label="Horário de funcionamento">
          <Input value={draft.hoursLabel} onChange={(event) => setDraft({ ...draft, hoursLabel: event.target.value })} />
        </Field>
        <Field label="Tempo médio de preparo (min)">
          <Input
            type="number"
            value={draft.prepMinutes}
            onChange={(event) => setDraft({ ...draft, prepMinutes: Number(event.target.value) })}
          />
        </Field>
        <Field label="Pedido mínimo">
          <Input type="number" value={draft.minOrder} onChange={(event) => setDraft({ ...draft, minOrder: Number(event.target.value) })} />
        </Field>
        <Field label="Área inicial de entrega">
          <Input value={draft.deliveryArea} onChange={(event) => setDraft({ ...draft, deliveryArea: event.target.value })} />
        </Field>
        <Button type="button" className="h-11 rounded-xl" onClick={() => void next()}>
          Continuar
        </Button>
      </div>
    </OnboardingShell>
  );
}

export function IdentityStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [preview, setPreview] = useState<string | null>(null);

  async function next() {
    saveDraft(draft);
    await fetch("/api/mipede/v1/onboarding/identity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        description: draft.description,
        primaryColor: draft.primaryColor,
      }),
    });
    router.push(routes.onboarding.review);
  }

  return (
    <OnboardingShell step={3} title="Identidade da loja">
      <div className="grid gap-4">
        <Field label="Descrição curta">
          <Input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </Field>
        <Field label="Cor principal">
          <Input value={draft.primaryColor} onChange={(event) => setDraft({ ...draft, primaryColor: event.target.value })} />
        </Field>
        <Field label="Logotipo (prévia local, sem upload)">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </Field>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Prévia do logotipo" className="h-16 w-16 rounded-xl object-cover" />
        ) : null}
        <Button type="button" className="h-11 rounded-xl" onClick={() => void next()}>
          Continuar
        </Button>
      </div>
    </OnboardingShell>
  );
}

export function ReviewStep() {
  const router = useRouter();
  const [draft] = useState<Draft>(loadDraft);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const response = await fetch("/api/mipede/v1/onboarding/submit", {
      method: "POST",
      credentials: "include",
    });
    if (response.status === 503) {
      router.push(routes.admin.performance);
      return;
    }
    if (!response.ok) {
      setError("Não foi possível enviar para análise.");
      return;
    }
    sessionStorage.removeItem("mipede_onboarding_draft");
    router.push(routes.admin.performance);
  }

  return (
    <OnboardingShell step={4} title="Revisão">
      <dl className="grid gap-2 text-sm">
        <Row label="Loja" value={draft.name} />
        <Row label="Slug" value={draft.slug} />
        <Row label="Cidade" value={`${draft.city} / ${draft.state}`} />
        <Row label="WhatsApp" value={draft.whatsapp} />
        <Row label="Horário" value={draft.hoursLabel} />
        <Row label="Pagamentos" value={draft.payments.join(", ")} />
      </dl>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <Button type="button" className="mt-5 h-11 w-full rounded-xl" onClick={() => void submit()}>
        Enviar para análise
      </Button>
    </OnboardingShell>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? `${className} block space-y-1.5` : "block space-y-1.5"}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2">
      <dt className="text-subtle">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
