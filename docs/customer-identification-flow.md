# Identificação do cliente

O consumidor compra sem criar conta. Os únicos dados básicos são **nome completo** e **WhatsApp**. Endereço só entra quando a modalidade é entrega.

## Primeira compra

1. Acessa o cardápio e monta o pedido.
2. Informa nome e WhatsApp.
3. Escolhe entrega, retirada ou consumo no local.
4. Cadastra endereço somente se for entrega.
5. Confirma o pedido.
6. Só depois da criação do pedido o dispositivo passa a ser reconhecido.

Preencher o formulário, sozinho, não cria reconhecimento.

## Cliente recorrente no mesmo dispositivo

O protótipo mostra o card `Encontramos seus dados neste dispositivo`, com nome, WhatsApp mascarado e último endereço. O cliente pode continuar, trocar dados, trocar ou adicionar endereço, ou usar **Não sou eu**.

## Dispositivo novo

Formulário vazio. Digitar um WhatsApp **não** revela nome nem endereços. O backend futuro poderá associar internamente pelo número normalizado, mas só devolve PII com sessão válida. Recuperação por código no WhatsApp fica para depois.

## Simulação atual (não é a segurança real)

- Chave: `mipede_demo_customer_session`
- Valor: token opaco (`demo_sess_juliana_home` ou `demo_sess_juliana_noaddr`)
- Os dados de Juliana Lima ficam só no mock
- Nome, WhatsApp e endereço **não** são gravados no `localStorage`
- Limpar o token volta ao primeiro acesso

Essa simulação existe apenas para o protótipo.

## Modelo futuro no D1

### customers

`id`, `store_id`, `name`, `whatsapp_normalized`, `created_at`, `updated_at`, `last_order_at`

### customer_addresses

`id`, `store_id`, `customer_id`, `label`, `street`, `number`, `district`, `city`, `state`, `postal_code`, `complement`, `reference`, `is_default`, `last_used_at`, `created_at`, `updated_at`

### customer_sessions

`id`, `store_id`, `customer_id`, `token_hash`, `created_at`, `expires_at`, `last_seen_at`, `revoked_at`

Pedidos guardam `store_id`, `customer_id`, endereço usado, origem/campanha, status e datas.

## Segurança da sessão real

- Token aleatório de alta entropia no navegador
- Banco guarda somente o hash
- Cookie `HttpOnly`, `Secure` e `SameSite`
- Worker valida a sessão antes de devolver PII
- Sessões expiram, rotacionam e podem ser revogadas
- **Não sou eu** desconecta o dispositivo
- Endereços não saem só com o WhatsApp
- WhatsApp normalizado como `+55...`
- Interface mascara o número sempre que possível
