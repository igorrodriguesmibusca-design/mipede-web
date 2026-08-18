# Autenticação do MiPede

Better Auth **1.6.29**, no Cloudflare Worker, com D1 (`mipede-control`).

O frontend na Vercel nunca fala direto com o D1 e nunca recebe secrets.

## Superfícies

| Público | Protegido |
| --- | --- |
| `/entrar` | `/admin` |
| `/cadastro/restaurante` | `/gestor` |
| `/verificar-email` | `/plataforma` |
| `/esqueci-minha-senha` | `/onboarding` |
| `/redefinir-senha` | `/preview` em produção |

O cardápio do consumidor (`/loja/...`) continua sem conta. A identificação do cliente não é login operacional.

## Fluxo

1. O responsável se cadastra em `/cadastro/restaurante`.
2. O BFF (`/api/mipede/v1/register`) encaminha ao Worker.
3. O Worker valida Zod, Turnstile e rejeita `role=platform_admin`.
4. Better Auth cria o usuário com hash próprio e envia verificação via Resend.
5. Sem e-mail verificado não existe sessão administrativa válida.
6. Depois da verificação, o onboarding cria organização + loja.
7. Login, logout e reset de senha passam pelo Better Auth. Reset revoga sessões.

## Cookies

Em produção:

```text
HttpOnly
Secure
SameSite=Lax
Path=/
```

A sessão **não** vai para `localStorage`, `sessionStorage` ou query string.

## BFF

```text
/api/mipede/auth/*
/api/mipede/v1/*
```

O Next.js replica método, corpo, cookies e `Set-Cookie`. Sem `MIPEDE_CONTROL_API_URL` o BFF responde **503**.

## Secrets

Somente no Worker (Wrangler Secrets):

- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `PLATFORM_ADMIN_EMAILS`

Nenhum secret usa `NEXT_PUBLIC_`.

## Demo visual

Enquanto o Worker não estiver provisionado, `MIPEDE_ALLOW_DEMO=1` (ou `NODE_ENV !== production`) mantém o protótipo da Pizzaria Imperial em `/preview`, `/admin` e `/gestor`, sempre com faixa de demonstração.

Uma sessão real **nunca** mistura esses mocks.
