# Painel interno e administradores

A autorização permanente vem de `platform_administrators` no D1.

`PLATFORM_ADMIN_EMAILS` serve só para o bootstrap único do primeiro `platform_owner`. Depois pode ser removido do Worker.

## Bootstrap

`POST /api/mipede/v1/platform/bootstrap` não aceita papel nem e-mail no corpo. Usa a sessão Google e a allowlist.

Primeiro owner previsto: Igor Rodrigues.

## Secrets do Worker

```bash
pnpm exec wrangler secret put MIPEDE_PII_ENCRYPTION_KEY --env production --config workers/control-api/wrangler.toml
pnpm exec wrangler secret put MIPEDE_EMAIL_LOOKUP_KEY --env production --config workers/control-api/wrangler.toml
```

Nome e e-mail administrativos ficam em AES-GCM. Busca usa HMAC-SHA-256.
