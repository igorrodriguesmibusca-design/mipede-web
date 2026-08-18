# Isolamento entre estabelecimentos

Arquitetura de controle global + dados operacionais separados.

## Banco global — `mipede-control`

D1 único para:

- autenticação Better Auth
- sessões
- organizações e integrantes
- registro das lojas
- onboarding e aprovação
- status de provisionamento
- auditoria

## Banco operacional futuro

Cada restaurante terá um D1 próprio:

```text
mipede-store-{storeUuid}
```

Lá ficarão clientes, endereços, cardápio, cupons, pedidos e analytics.

**Esta etapa não cria esses bancos.** O campo `provisioning_status` já existe (`NOT_STARTED` … `FAILED`).

Não armazenar pedidos ou clientes de várias lojas em uma tabela operacional global provisória.

## Resolução do tenant

Toda rota protegida segue:

1. Validar a sessão no Worker.
2. Carregar o usuário no servidor.
3. Carregar memberships.
4. Comparar `storeId` / `organizationId` / `slug` da URL com o membership.
5. Recusar com 403/404 se não houver correspondência.

O navegador pode enviar um ID. Isso **não** autoriza nada.

## Papéis

| Papel | Pode | Não pode |
| --- | --- | --- |
| `owner` | Tudo da própria loja, equipe, financeiro | Apagar o único owner sem transferir |
| `admin` | Cardápio, pedidos, clientes, marketing, equipe | Transferir propriedade, apagar org |
| `operator` | Gestor de Pedidos, andamento, pausar itens | Financeiro, equipe, plataforma |
| `platform_admin` | Aprovar/suspender lojas | Ser escolhido no cadastro público |

`platform_admin` só nasce de `PLATFORM_ADMIN_EMAILS` no servidor.

## Troca de loja

Usuário da Loja A alterando URL/body para a Loja B recebe **404** (recurso inexistente no contexto autorizado) ou **403**. Nenhum dado da Loja B é devolvido.
