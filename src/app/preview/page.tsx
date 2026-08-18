import Link from "next/link";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { routes } from "@/lib/routes";

const storefront = [
  { href: routes.store.onboarding, label: "Onboarding / splash" },
  { href: routes.store.home, label: "Página inicial" },
  { href: routes.store.product("pizza-calabresa"), label: "Produto com adicionais" },
  { href: routes.store.cart, label: "Carrinho preenchido" },
  { href: routes.store.cartEmpty, label: "Carrinho vazio" },
  { href: routes.store.identify, label: "Identificação vazia" },
  { href: routes.store.identifyFilled, label: "Identificação preenchida" },
  { href: routes.store.identifyError, label: "Identificação com erro" },
  { href: routes.store.address, label: "Cadastro de endereço" },
  { href: routes.store.checkout, label: "Finalização sem endereço" },
  { href: routes.store.checkoutAddress, label: "Finalização com endereço" },
  { href: routes.store.coupons, label: "Cupons" },
  { href: routes.store.orders, label: "Pedidos preenchidos" },
  { href: routes.store.ordersEmpty, label: "Pedidos vazios" },
  { href: routes.store.order("183747"), label: "Detalhes do pedido" },
  { href: routes.store.orderFull("183720"), label: "Detalhes completos do pedido" },
];

const admin = [
  { href: routes.admin.performance, label: "Desempenho" },
  { href: routes.admin.orders, label: "Pedidos" },
  { href: routes.admin.categories, label: "Categorias" },
  { href: routes.admin.products, label: "Produtos" },
  { href: routes.admin.addons, label: "Complementos" },
  { href: routes.admin.coupons, label: "Promoções e Cupons" },
  { href: routes.admin.customers, label: "Clientes" },
  { href: routes.admin.store, label: "Configuração da Loja" },
  { href: routes.admin.delivery, label: "Entrega e Pagamento" },
  { href: routes.admin.tracking, label: "Links de Rastreamento" },
];

export default function PreviewPage() {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <MipedeLogo />
        <h1 className="mt-6 text-3xl font-semibold">Central de visualização</h1>
        <p className="mt-2 max-w-2xl text-sm text-subtle">
          Hub temporário para revisar o protótipo visual estático do MiPede. Não
          representa uma tela final do produto. Todos os dados são fictícios e
          nenhum fluxo salva informações.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Section title="Cardápio do consumidor" items={storefront} />
          <Section
            title="Link da bio"
            items={[{ href: routes.bio, label: "Link da bio — Pizzaria Imperial" }]}
            note="Versão provisória: a pasta de referências estava vazia."
          />
          <Section title="Painel administrativo" items={admin} />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  note,
}: {
  title: string;
  items: { href: string; label: string }[];
  note?: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-semibold">{title}</h2>
      {note ? <p className="mb-3 text-xs text-subtle">{note}</p> : null}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm font-medium text-brand hover:underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
