# Arquitetura do Gestor de Pedidos

O MiPede separa três experiências:

| Experiência | Responsabilidade | Rota |
| --- | --- | --- |
| Cardápio do consumidor | Pedido do cliente | `/loja`, `/bio` |
| Painel administrativo | Configuração, métricas e histórico | `/admin` |
| Gestor de Pedidos | Operação em tempo real | `/gestor/pizzaria-imperial` |

O Gestor possui layout, navegação e estado próprios. Não usa a sidebar do Admin.

## Fluxo de status

Entrega própria:

`NOVO → ACEITO → EM_PREPARO → PRONTO → EM_ROTA → FINALIZADO`

Retirada ou consumo no local:

`NOVO → ACEITO → EM_PREPARO → PRONTO → FINALIZADO`

Cancelamento permitido a partir de Novo, Aceito ou Em preparo, com motivo e confirmação.

Nesta etapa o fluxo é apenas visual, com estado local e timestamps demonstrativos.

## Interações demonstrativas

- Simular novo pedido
- Aceitar, produzir, marcar pronto, expedir, finalizar
- Selecionar entregador próprio
- Pausar produto ou categoria
- Abrir/fechar loja
- Som somente após interação do usuário
- Estados de conexão mockados

## Limitações atuais

- Sem persistência
- Sem Workers, Durable Objects, WebSockets reais ou polling
- Sem GPS
- Sem app de entregador
- Sem autenticação operacional (ainda será definida)
- Timers apenas para relógio e rótulo de sincronização

## Fonte oficial futura

O **Cloudflare D1** será a fonte persistente. O tempo real do Gestor usará **Durable Objects** e WebSockets. Ver `docs/cloudflare-architecture.md`.

Fluxo futuro:

1. Cliente finaliza o pedido.
2. Worker valida e grava no D1.
3. O Durable Object `store:{storeId}:order-manager` recebe a alteração.
4. Gestores conectados recebem o evento.
5. A interface atualiza sem recarregar.
6. O operador altera o status.
7. Worker valida a transição e persiste no D1.
8. O Admin lê dados persistidos para métricas.

## Eventos futuros

- `order.created`
- `order.accepted`
- `order.preparation_started`
- `order.ready`
- `order.driver_assigned`
- `order.out_for_delivery`
- `order.completed`
- `order.cancelled`
- `store.status_changed`
- `catalog.item_availability_changed`

## Tabelas futuras (conceitual, D1)

- `stores`
- `customers`
- `customer_addresses`
- `customer_sessions`
- `orders`
- `order_items`
- `order_item_options`
- `order_status_history`
- `store_users`
- `drivers`
- `delivery_assignments`
- `catalog_availability_events`

## Reconexão futura

Mensagens em tempo real não substituem o D1. Ao abrir ou reconectar:

1. Buscar pedidos ativos no D1.
2. Construir o estado atual.
3. Assinar o Durable Object da loja.
4. Aplicar novos eventos.
5. Rebuscar se houver inconsistência.

## Segurança futura

- Não confiar apenas no status enviado pelo navegador.
- Validar transições no Worker.
- Verificar estabelecimento e usuário operacional.
- Registrar histórico com usuário, data, status anterior e novo.
- Usar idempotência.
- Impedir atualização de pedidos de outra loja.
- Isolar tudo por `store_id`.
