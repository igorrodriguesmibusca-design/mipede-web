# Arquitetura Cloudflare do MiPede

Decisão oficial da plataforma. Clerk e Supabase **não** fazem parte da arquitetura.

## Situação atual

- O frontend Next.js continua hospedado na **Vercel**.
- Esta etapa é um protótipo visual. Nenhum Worker, D1, R2, Durable Object, Queue ou Turnstile está provisionado.

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
- Autenticação de funcionários, administradores e operadores **ainda será definida**.
- Identificação do consumidor não se confunde com login operacional.

## Isolamento

Todos os dados são isolados por `store_id`.
