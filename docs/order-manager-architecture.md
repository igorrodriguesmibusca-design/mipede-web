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
- Sem WebSocket, Supabase Realtime ou polling
- Sem GPS
- Sem app de entregador
- Sem autenticação
- Timers apenas para relógio e rótulo de sincronização

## Fonte oficial futura

O PostgreSQL será a fonte oficial. O Realtime apenas notifica as interfaces.

Fluxo futuro:

1. Cliente finaliza o pedido.
2. Backend valida e grava.
3. Banco registra o pedido.
4. Evento privado chega ao Gestor.
5. Gestor atualiza a interface.
6. Operador altera o status.
7. Backend valida a transição.
8. Banco persiste o novo status.
9. Evento atualizado é enviado.
10. O Admin lê dados persistidos para métricas.

Canal sugerido: `store:{storeId}:orders`

O canal deve ser privado, limitado ao estabelecimento e protegido por autenticação e RLS.

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

## Tabelas futuras (conceitual)

- `stores`
- `orders`
- `order_items`
- `order_item_options`
- `order_status_history`
- `store_users`
- `drivers`
- `delivery_assignments`
- `catalog_availability_events`

## Reconexão futura

Mensagens Realtime não substituem o banco. Ao abrir ou reconectar:

1. Buscar pedidos ativos no banco.
2. Construir o estado atual.
3. Assinar o canal privado.
4. Aplicar novos eventos.
5. Rebuscar se houver inconsistência.

## Segurança futura

- Não confiar apenas no status enviado pelo navegador.
- Validar transições no servidor.
- Verificar estabelecimento e usuário.
- Registrar histórico com usuário, data, status anterior e novo.
- Usar idempotência.
- Impedir atualização de pedidos de outra loja.
