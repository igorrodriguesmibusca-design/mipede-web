# Infraestrutura de autenticação

Staging e produção são isolados. Nunca compartilham o mesmo D1.

## Cloudflare

Conta usada: a mesma já ligada ao time da Vercel do MiPede.

| Ambiente | Worker | D1 |
| --- | --- | --- |
| Staging | `mipede-control-api-staging` | `mipede-control-staging` |
| Produção | `mipede-control-api` | `mipede-control-production` |

Health público (sem dados internos):

* Staging: `https://mipede-control-api-staging.aliceecosta1425.workers.dev/health`
* Produção: `https://mipede-control-api.aliceecosta1425.workers.dev/health`

Migrations: `workers/control-api/migrations/0001_init.sql`. O Wrangler registra o controle em `d1_migrations`.

Binding do Worker: `DB`.

## Vercel

| Variável | Produção | Preview / Development |
| --- | --- | --- |
| `MIPEDE_CONTROL_API_URL` | Worker de produção | Worker de staging |
| `MIPEDE_BFF_SHARED_SECRET` | secret de produção | secret de staging |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | widget de produção | widget de staging |
| `MIPEDE_ALLOW_DEMO` | `0` | `1` |

O navegador só chama `/api/mipede/*`. O BFF envia `x-mipede-bff-secret`. Sem esse cabeçalho o Worker responde 403.

## Secrets (somente Wrangler / Vercel)

Nunca versionar:

* `BETTER_AUTH_SECRET` (diferente em cada ambiente)
* `MIPEDE_BFF_SHARED_SECRET`
* `TURNSTILE_SECRET_KEY`
* `PLATFORM_ADMIN_EMAILS`
* `TRUSTED_ORIGINS` (`https://mipede-web.vercel.app`)
* `RESEND_API_KEY` (ainda não provisionado)

## Publicar

```bash
pnpm exec wrangler deploy --env staging --config workers/control-api/wrangler.toml
pnpm exec wrangler deploy --env production --config workers/control-api/wrangler.toml
npx vercel --prod --yes
```

## E-mail

O Resend ainda não tem API key nem domínio verificado. Cadastro e recuperação ficam bloqueados no envio até isso ser configurado:

```bash
pnpm exec wrangler secret put RESEND_API_KEY --env staging --config workers/control-api/wrangler.toml
pnpm exec wrangler secret put RESEND_FROM_EMAIL --env staging --config workers/control-api/wrangler.toml
```

Use somente um remetente de domínio já verificado no Resend.
