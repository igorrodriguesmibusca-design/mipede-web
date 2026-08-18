import Link from "next/link";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { DemoCustomerSessionControls } from "@/components/storefront/demo-customer-session-controls";
import { routes } from "@/lib/routes";

const storefront = [
  { href: routes.store.onboarding, label: "Onboarding / splash" },
  { href: routes.store.home, label: "Página inicial" },
  { href: routes.store.product("pizza-calabresa"), label: "Produto com adicionais" },
  { href: routes.store.cart, label: "Carrinho preenchido" },
  { href: routes.store.cartEmpty, label: "Carrinho vazio" },
  { href: `${routes.store.identify}?novo=1`, label: "Cliente novo — sem reconhecimento" },
  { href: routes.store.identifyRecognized, label: "Cliente recorrente — reconhecido" },
  { href: routes.store.identifyError, label: "WhatsApp inválido" },
  { href: routes.store.identifyFilled, label: "Identificação preenchida" },
  { href: routes.store.address, label: "Endereços salvos / cadastro" },
  { href: `${routes.store.checkout}?mode=entrega`, label: "Checkout para entrega" },
  { href: `${routes.store.checkout}?mode=retirada`, label: "Checkout para retirada" },
  { href: `${routes.store.checkout}?mode=local`, label: "Checkout para consumo no local" },
  { href: routes.store.checkoutAddress, label: "Finalização com endereço" },
  { href: routes.store.coupons, label: "Cupons" },
  { href: routes.store.orders, label: "Pedidos preenchidos" },
  { href: routes.store.ordersEmpty, label: "Pedidos vazios" },
  { href: routes.store.order("183747"), label: "Detalhes do pedido" },
  { href: routes.store.orderFull("183720"), label: "Detalhes completos do pedido" },
];

const bio = [
  { href: routes.bio, label: "Link na Bio — mobile" },
  { href: routes.bio, label: "Link na Bio — desktop (abrir acima de 1024px)" },
];

const admin = [
  { href: routes.admin.performance, label: "Desempenho — Vendas" },
  { href: routes.admin.performanceMenu, label: "Desempenho — Cardápio" },
  { href: routes.admin.performanceCancellations, label: "Desempenho — Cancelamentos" },
  { href: routes.admin.categories, label: "Categorias" },
  { href: routes.admin.categories, label: "Nova categoria (abre modal na listagem)" },
  { href: routes.admin.products, label: "Produtos" },
  { href: routes.admin.productNew, label: "Novo produto" },
  { href: routes.admin.addons, label: "Complementos" },
  { href: routes.admin.orders, label: "Histórico de Pedidos (Admin)" },
  { href: routes.admin.coupons, label: "Cupons" },
  { href: routes.admin.coupon("fretegratis"), label: "Detalhes FRETEGRATIS" },
  { href: routes.admin.coupon("bemvindo10"), label: "Detalhes BEMVINDO10" },
  { href: routes.admin.coupon("menos20"), label: "Detalhes MENOS20" },
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
          nenhum fluxo salva informações pessoais no navegador.
        </p>

        <div className="mt-6 max-w-md">
          <DemoCustomerSessionControls />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Section title="Cardápio do consumidor" items={storefront} />
          <Section
            title="Link da bio"
            items={bio}
            note="A versão mobile permanece igual. A composição desktop aparece a partir de 1024px."
          />
          <Section title="Painel administrativo" items={admin} />
          <Section
            title="Gestor de Pedidos"
            items={[
              { href: routes.manager.root, label: "Início do Gestor" },
              { href: routes.manager.orders, label: "Pedidos operacionais" },
              { href: routes.manager.dispatch, label: "Expedição" },
              { href: routes.manager.catalog, label: "Cardápio rápido" },
              { href: routes.manager.history, label: "Histórico operacional" },
              { href: routes.manager.settings, label: "Configurações" },
              { href: routes.admin.orders, label: "Histórico de Pedidos no Admin" },
            ]}
            note="Experiência independente do painel administrativo, focada na operação em tempo real."
          />
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
          <li key={`${item.href}-${item.label}`}>
            <Link href={item.href} className="text-sm font-medium text-brand hover:underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
