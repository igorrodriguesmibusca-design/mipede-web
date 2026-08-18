# MiPede

Cardápio digital próprio para estabelecimentos com entrega própria.

O frontend visual continua na Vercel. Esta etapa adiciona a fundação funcional: cadastro de restaurantes, Better Auth no Worker, D1 de controle, onboarding e isolamento entre lojas.

Worker e D1 de staging/produção estão no ar. O BFF da Vercel fala com o Worker por um segredo compartilhado. Produção não usa modo demonstração.

O envio de e-mail (verificação e senha) ainda depende do Resend com domínio verificado.

## Loja do protótipo

- Nome: **Pizzaria Imperial**
- Situação: Aberto
- Pedido mínimo: R$ 30,00
- Tempo estimado: 45–60 minutos
- Modalidade: Entrega própria

## Tecnologias

Frontend atual (Vercel):

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide Icons
- pnpm

Backend de controle (código no repo, conta Cloudflare ainda não provisionada):

- Cloudflare Worker `mipede-control-api`
- D1 `mipede-control`
- Better Auth 1.6.29 + Organization Plugin
- Resend e Turnstile
- Sem Supabase e sem Clerk

Documentos: `docs/authentication-architecture.md`, `docs/tenant-isolation.md`, `docs/restaurant-onboarding.md`, `docs/security-threat-model.md`.

## Como rodar

```bash
pnpm install
pnpm dev
```

Validações:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Copie `.env.example` e `.dev.vars.example`. Não commite secrets.

Worker local (depois de criar o D1 e os secrets):

```bash
pnpm worker:dev
```

## Rotas

### Central

| Rota | Descrição |
| --- | --- |
| `/` | Redireciona para `/preview` |
| `/preview` | Central temporária de visualização (protegida em produção) |
| `/entrar` | Login do responsável/equipe |
| `/cadastro/restaurante` | Cadastro do responsável |
| `/verificar-email` | Aviso de verificação |
| `/esqueci-minha-senha` | Recuperação de senha |
| `/redefinir-senha` | Nova senha |
| `/onboarding/*` | Empresa, operação, identidade e revisão |
| `/plataforma/estabelecimentos` | Painel interno MiPede |

### Cardápio

| Rota | Estado |
| --- | --- |
| `/loja/pizzaria-imperial/onboarding` | Splash |
| `/loja/pizzaria-imperial` | Página inicial |
| `/loja/pizzaria-imperial/produto/[id]` | Produto com adicionais |
| `/loja/pizzaria-imperial/carrinho` | Carrinho preenchido |
| `/loja/pizzaria-imperial/carrinho/vazio` | Carrinho vazio |
| `/loja/pizzaria-imperial/identificacao` | Identificação (novo ou reconhecido) |
| `/loja/pizzaria-imperial/identificacao/preenchido` | Identificação preenchida |
| `/loja/pizzaria-imperial/identificacao/erro` | Identificação com erro |
| `/loja/pizzaria-imperial/identificacao/reconhecido` | Cliente recorrente |
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
| `/bio/pizzaria-imperial` | Mobile preservado. Desktop a partir de 1024px com carrossel e destaques. |

### Painel administrativo

| Rota | Tela |
| --- | --- |
| `/admin` | Redireciona para Desempenho |
| `/admin/desempenho` | Desempenho — Vendas |
| `/admin/desempenho/cardapio` | Desempenho — Cardápio |
| `/admin/desempenho/cancelamentos` | Desempenho — Cancelamentos |
| `/admin/pedidos` | Histórico de Pedidos |
| `/admin/cardapio/categorias` | Categorias (modal Nova categoria) |
| `/admin/cardapio/produtos` | Produtos |
| `/admin/cardapio/produtos/novo` | Novo produto |
| `/admin/cardapio/complementos` | Complementos |
| `/admin/marketing/promocoes-cupons` | Promoções e Cupons |
| `/admin/marketing/cupons/fretegratis` | Detalhe FRETEGRATIS |
| `/admin/marketing/cupons/bemvindo10` | Detalhe BEMVINDO10 |
| `/admin/marketing/cupons/menos20` | Detalhe MENOS20 |
| `/admin/clientes` | Clientes |
| `/admin/configuracoes/loja` | Configuração da Loja |
| `/admin/configuracoes/entrega-pagamento` | Entrega e Pagamento |
| `/admin/marketing/links-rastreamento` | Links de Rastreamento |

### Gestor de Pedidos

Experiência operacional independente do painel administrativo.

| Rota | Tela |
| --- | --- |
| `/gestor/pizzaria-imperial` | Início da operação |
| `/gestor/pizzaria-imperial/pedidos` | Fila operacional |
| `/gestor/pizzaria-imperial/expedicao` | Expedição própria |
| `/gestor/pizzaria-imperial/cardapio` | Cardápio rápido |
| `/gestor/pizzaria-imperial/historico` | Histórico operacional |
| `/gestor/pizzaria-imperial/configuracoes` | Configurações da operação |

## Observações

- O MiPede não é um marketplace.
- Pagamentos no protótipo são apenas visuais e acontecem diretamente ao estabelecimento.
- Interações de cadastro, Kanban e cupons usam estado local e voltam ao mock ao recarregar.
- O mapa de referências visuais está em `docs/visual-reference-map.md`.
- As regras de analytics futuro estão em `docs/analytics-event-map.md`.
- A arquitetura do Gestor e do Realtime futuro está em `docs/order-manager-architecture.md`.
