# Arquitetura Cloudflare do MiPede

Decisão oficial da plataforma. Clerk e Supabase **não** fazem parte da arquitetura.

## Situação atual

- O frontend Next.js continua hospedado na **Vercel**.
- O código do Worker de controle (`workers/control-api`) e a migration do D1 `mipede-control` existem no repositório.
- O Worker, o D1, o Resend e o Turnstile **ainda não foram provisionados** na conta Cloudflare. Sem isso o BFF responde 503.
- `/preview` e o painel visual da Pizzaria Imperial permanecem disponíveis só em demonstração explícita.

## Frontend

- Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- Hospedagem atual: [Vercel](https://vercel.com)

## Backend e dados futuros

### [Cloudflare Workers](https://developers.cloudflare.com/workers/)

APIs, validações, regras de negócio, criação de pedidos, isolamento por estabelecimento, sessões de cliente e orquestração com D1, R2, Durable Objects e Queues.

### [Cloudflare D1](https://developers.cloudflare.com/d1/)

Fonte oficial e persistente. Banco SQL baseado em SQLite, **não** PostgreSQL.

Guardará estabelecimentos, clientes, endereços, cardápio, pedidos, cupons, campanhas, links de rastreamento, eventos de conversão e, no futuro, usuários administrativos.

A camada de acesso e as migrations serão definidas na fase de backend.

### [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) + WebSockets

Estado operacional em tempo real do Gestor de Pedidos. Conceito: um Durable Object por loja, por exemplo `store:{storeId}:order-manager`.

1. Worker valida o pedido.
2. Worker persiste no D1.
3. O Durable Object da loja recebe a alteração.
4. Transmite aos gestores conectados.
5. A interface atualiza sem recarregar.
6. Ações do operador também são persistidas no D1.

O Durable Object **não** substitui o D1.

### [Cloudflare R2](https://developers.cloudflare.com/r2/)

Fotos de produtos, logotipos, banners, campanhas, materiais do Link na Bio e arquivos do cardápio.

### [Cloudflare Queues](https://developers.cloudflare.com/queues/)

Analytics, notificações, métricas e tarefas que não devem atrasar a criação do pedido.

### Cloudflare Turnstile

Poderá proteger ações públicas sensíveis. Não implementado agora.

## Autenticação

- Consumidor **não** cria conta, e-mail ou senha.
- Responsáveis, administradores e operadores autenticam com **Better Auth 1.6.29** no Worker, banco D1 `mipede-control`.
- Identificação do consumidor não se confunde com login operacional.
- Detalhes: `docs/authentication-architecture.md`.

## Isolamento

Controle global em `mipede-control`. Dados operacionais futuros em `mipede-store-{storeUuid}`.

O tenant é resolvido no servidor a partir da sessão. `storeId` enviado pelo navegador não autoriza acesso. Ver `docs/tenant-isolation.md`.
