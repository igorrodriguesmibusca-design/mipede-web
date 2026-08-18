# MiPede

Protótipo visual estático e navegável do MiPede, uma plataforma de cardápios digitais próprios para estabelecimentos com entrega própria.

Esta entrega **não possui backend, autenticação, banco de dados ou integrações reais**. Todos os dados são fictícios e os botões apenas navegam entre estados visuais.

## Loja do protótipo

- Nome: **Pizzaria Imperial**
- Situação: Aberto
- Pedido mínimo: R$ 30,00
- Tempo estimado: 45–60 minutos
- Modalidade: Entrega própria

## Tecnologias

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide Icons
- pnpm

## Como rodar

```bash
pnpm install
pnpm dev
```

Validações:

```bash
pnpm lint
pnpm typecheck
```

Não é necessário criar arquivo `.env`.

## Rotas

### Central

| Rota | Descrição |
| --- | --- |
| `/` | Redireciona para `/preview` |
| `/preview` | Central temporária de visualização |

### Cardápio

| Rota | Estado |
| --- | --- |
| `/loja/pizzaria-imperial/onboarding` | Splash |
| `/loja/pizzaria-imperial` | Página inicial |
| `/loja/pizzaria-imperial/produto/[id]` | Produto com adicionais |
| `/loja/pizzaria-imperial/carrinho` | Carrinho preenchido |
| `/loja/pizzaria-imperial/carrinho/vazio` | Carrinho vazio |
| `/loja/pizzaria-imperial/identificacao` | Identificação vazia |
| `/loja/pizzaria-imperial/identificacao/preenchido` | Identificação preenchida |
| `/loja/pizzaria-imperial/identificacao/erro` | Identificação com erro |
| `/loja/pizzaria-imperial/endereco` | Cadastro de endereço |
| `/loja/pizzaria-imperial/checkout` | Finalização sem endereço |
| `/loja/pizzaria-imperial/checkout/endereco` | Finalização com endereço |
| `/loja/pizzaria-imperial/cupons` | Cupons |
| `/loja/pizzaria-imperial/pedidos` | Pedidos preenchidos |
| `/loja/pizzaria-imperial/pedidos/vazio` | Pedidos vazios |
| `/loja/pizzaria-imperial/pedidos/[id]` | Detalhes do pedido |
| `/loja/pizzaria-imperial/pedidos/[id]/completo` | Detalhes completos |

### Link da bio

| Rota | Observação |
| --- | --- |
| `/bio/pizzaria-imperial` | **Provisória.** A pasta de referências estava vazia e a tela será refinada quando as imagens forem enviadas. |

### Painel administrativo

| Rota | Tela |
| --- | --- |
| `/admin` | Redireciona para Desempenho |
| `/admin/desempenho` | Desempenho |
| `/admin/pedidos` | Pedidos |
| `/admin/cardapio/categorias` | Categorias |
| `/admin/cardapio/produtos` | Produtos |
| `/admin/cardapio/complementos` | Complementos |
| `/admin/marketing/promocoes-cupons` | Promoções e Cupons |
| `/admin/clientes` | Clientes |
| `/admin/configuracoes/loja` | Configuração da Loja |
| `/admin/configuracoes/entrega-pagamento` | Entrega e Pagamento |
| `/admin/marketing/links-rastreamento` | Links de Rastreamento |

## Observações

- O MiPede não é um marketplace.
- Pagamentos no protótipo são apenas visuais e acontecem diretamente ao estabelecimento.
- O mapa de referências visuais está em `docs/visual-reference-map.md`.
