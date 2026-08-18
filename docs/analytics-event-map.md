# Mapa de eventos e fórmulas do MiPede

Documento de referência para o backend futuro. Nenhum evento é disparado nesta etapa e o PostHog não está instalado.

## Funil de conversão do cardápio

O funil é fechado e baseado em sessões. Cada sessão conta no máximo uma vez em cada etapa e precisa percorrer as etapas na ordem.

| Etapa | Evento futuro | Momento de disparo |
| --- | --- | --- |
| Visitas ao cardápio | `menu_session_started` | Primeiro acesso à loja na sessão |
| Visualizaram um produto | `product_viewed` | Abertura da página de adicionais |
| Adicionaram à sacola | `item_added_to_cart` | Confirmação de item no carrinho |
| Iniciaram o checkout | `checkout_started` | Entrada na identificação/checkout |
| Concluíram o pedido | `order_completed` | Pedido confirmado com sucesso |

Identificador de sessão: `session_id` gerado no primeiro `menu_session_started` e reutilizado até o encerramento da visita.

## Fórmulas de conversão

Conversão geral:

`pedidos concluídos ÷ visitas ao cardápio × 100`

Conversão acumulada de uma etapa:

`sessões da etapa ÷ visitas ao cardápio × 100`

Conversão entre etapas:

`sessões da etapa atual ÷ sessões da etapa anterior × 100`

## Fórmulas de abandono

`(sessões da etapa anterior − sessões da etapa atual) ÷ sessões da etapa anterior × 100`

Variação contra o período anterior:

`(valor atual − valor anterior) ÷ valor anterior × 100`

Se o valor anterior for zero, exibir `—` ou “Sem comparação”. Não dividir por zero.

## Métricas de produtos

Quantidade vendida: soma das unidades do produto em pedidos concluídos.

Faturamento gerado: soma do preço líquido do item × quantidade.

Ticket médio do item: faturamento gerado ÷ quantidade vendida.

Não incluir pedidos cancelados, taxa de entrega nem valores reembolsados.

## Métricas de complementos

Quantidade vendida: soma das unidades do complemento em pedidos concluídos.

Faturamento adicional: soma do preço adicional × quantidade.

Valor médio: faturamento adicional ÷ quantidade vendida.

Complementos gratuitos podem ter faturamento `R$ 0,00`.

## Métricas de cupons

Investimento promocional: soma dos descontos e benefícios financiados pela loja em pedidos concluídos (desconto em reais, percentual convertido e frete grátis).

Faturamento gerado: soma dos subtotais líquidos dos pedidos concluídos com cupom, sem taxa de entrega.

Pedidos com cupom: quantidade de pedidos concluídos que usaram algum cupom.

ROI promocional estimado:

`(faturamento gerado − investimento promocional) ÷ investimento promocional × 100`

Ticket médio: faturamento gerado ÷ pedidos com o cupom.

Custo médio por pedido: investimento ÷ pedidos com o cupom.

Se o investimento for zero, o ROI deve ser `—`.

## ROI real vs ROI promocional estimado

O indicador desta etapa é **ROI promocional estimado**. Ele não desconta custo de produção, embalagem, impostos ou comissões. O ROI real só poderá ser calculado quando o backend tiver custo de item e conciliação financeira.

## Cliente e métricas

Pedidos, faturamento e ticket médio devem ser associados pelo `customer_id` persistido no D1, sem depender do texto do nome ou do telefone.

A sessão de visita do funil (`session_id`) é diferente da sessão segura do cliente (`customer_sessions`).

## Dependências futuras de banco e rastreamento

Dependem de persistência no Cloudflare D1, eventos via Workers/Queues e tempo real via Durable Objects:

- sessão única por visita
- funil fechado na ordem correta
- ranking de produtos e complementos
- taxa e motivos de cancelamento
- investimento, faturamento e ROI de cupons
- atualização automática do Gestor
- reconhecimento de cliente recorrente após o pedido
