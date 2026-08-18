"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminJson } from "@/lib/admin-api";
import { useTenant } from "@/lib/tenant-context";

export function ShareStoreButton() {
  const tenant = useTenant();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (tenant.mode !== "live") return;
    void adminJson<{ href: string }>("/api/mipede/v1/store-link")
      .then((payload) => setHref(payload.href))
      .catch(() => {
        if (tenant.mode === "live" && tenant.store) setHref(`${window.location.origin}/loja/${tenant.store.slug}`);
      });
  }, [tenant]);

  if (!href) {
    return (
      <span className="flex size-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-300">
        <Share2 className="size-4" />
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label="Compartilhar cardápio"
      className="flex size-10 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50"
      onClick={() => void shareStoreLink(href)}
    >
      <Share2 className="size-4" />
    </button>
  );
}

export function StorePublicLinkCard({ compact = false }: { compact?: boolean }) {
  const tenant = useTenant();
  const [href, setHref] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tenant.mode !== "live") return;
    void fetch("/api/mipede/v1/store-link", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { href?: string } | null) => {
        if (payload?.href) setHref(payload.href);
        else if (tenant.store) setHref(`${window.location.origin}/loja/${tenant.store.slug}`);
      });
  }, [tenant]);

  const displayHref = href || (tenant.mode === "live" ? "" : "/loja/pizzaria-imperial");
  if (!displayHref) return null;

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-4">
      <p className="font-medium">Link do cardápio</p>
      <p className="mt-1 break-all text-sm text-subtle">{displayHref}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(displayHref).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          <Copy className="size-3.5" />
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <a href={displayHref} target="_blank" rel="noreferrer" className="inline-flex">
          <Button size="sm" variant="outline">
            <ExternalLink className="size-3.5" />
            Abrir
          </Button>
        </a>
        <Button size="sm" variant="outline" onClick={() => void shareStoreLink(displayHref)}>
          WhatsApp
        </Button>
      </div>
      {!compact ? (
        <p className="mt-2 text-xs text-subtle">
          O link público só fica disponível para clientes quando a loja estiver ativa.
        </p>
      ) : null}
    </section>
  );
}

export async function shareStoreLink(href: string) {
  const text = `Peça pelo cardápio MiPede: ${href}`;
  if (navigator.share) {
    await navigator.share({ title: "Cardápio MiPede", url: href, text }).catch(() => undefined);
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
