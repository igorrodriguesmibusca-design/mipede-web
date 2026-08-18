# Onboarding do restaurante

Depois da verificação de e-mail:

1. `/onboarding/empresa` — nome, segmento, WhatsApp, responsável, CNPJ opcional, cidade, UF, slug.
2. `/onboarding/operacao` — entrega, retirada, salão, horário, preparo, pedido mínimo, pagamentos, área.
3. `/onboarding/identidade` — descrição, cor, prévia local de logo/capa. Upload no R2 fica para depois.
4. `/onboarding/revisao` — **Enviar para análise**.

O envio muda o status para `PENDING_REVIEW`, grava auditoria e abre o painel da própria loja.

## Slug

- minúsculas, números e hífen
- único
- bloqueado: `admin`, `gestor`, `api`, `plataforma`, `preview`, `login`, `entrar`, `cadastro`, `onboarding` e equivalentes

## Depois do envio

O proprietário vê as mesmas telas já construídas (Desempenho, Cardápio, Pedidos, Marketing, Clientes, Configurações, Gestor).

Enquanto a loja não está `APPROVED`/`ACTIVE`:

- estados vazios
- faixa **Estabelecimento aguardando aprovação**
- zero dados da Pizzaria Imperial
- cardápio público desligado
- sem pedidos reais
