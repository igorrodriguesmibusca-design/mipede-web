# Dados operacionais do MiPede

A autenticação continua no D1 de controle (`mipede-control-*`). O cardápio, as configurações da loja, cupons, links e pedidos ficam no D1 operacional (`mipede-app-*`) com isolamento lógico por `store_id`.

## Bancos

- Controle staging: `mipede-control-staging`
- Controle produção: `mipede-control-production`
- Operacional staging: `mipede-app-staging` (`APP_DB`)
- Operacional produção: `mipede-app-production` (`APP_DB`)
- Mídia staging: `mipede-media-staging` (`MEDIA`)
- Mídia produção: `mipede-media-production` (`MEDIA`)

O `store_id` nunca autoriza acesso se vier do navegador. O Worker resolve a loja pela sessão e pelo membership.

O carrinho público é temporário e fica no navegador, separado por loja. Preços enviados pelo cliente não são confiáveis: ao criar um pedido no futuro, o servidor deve recalcular o total com os preços atuais do APP_DB.

## Onboarding

O cadastro público reutiliza a loja existente do usuário. Só um estabelecimento `public_onboarding` ativo por proprietário. Novas lojas no futuro exigem um fluxo explícito “Adicionar estabelecimento”.
