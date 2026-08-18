import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export type AttentionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export function PlatformAttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
          <div>
            <h2 className="font-semibold text-emerald-900">Tudo certo por aqui</h2>
            <p className="mt-1 text-sm text-emerald-800">Não existem pendências que precisam da sua atenção.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-5">
      <h2 className="font-semibold">Atenção necessária</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-sm text-subtle">{item.description}</p>
            </div>
            <Link
              href={item.href}
              className="shrink-0 rounded-xl bg-brand px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-hover"
            >
              {item.actionLabel}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
