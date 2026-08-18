# Autenticação com Google (sem domínio próprio)

Enquanto o MiPede não tiver domínio verificado, o cadastro e o login públicos usam **Continuar com Google**.

E-mail e senha continuam no código, mas estão desligados no Worker:

```text
MIPEDE_EMAIL_PASSWORD_AUTH_ENABLED=0
MIPEDE_GOOGLE_AUTH_ENABLED=1
```

O Resend permanece preparado e **não é obrigatório**. Nenhum e-mail é enviado nesta fase. O domínio de teste do Resend não é usado com restaurantes.

## Callback

Better Auth `basePath` = `/api/mipede/auth`.

```text
https://mipede-web.vercel.app/api/mipede/auth/callback/google
http://localhost:3000/api/mipede/auth/callback/google
```

O navegador chama o BFF. O Client Secret fica só no Worker.

## Google Cloud Console

1. Projeto **MiPede**.
2. Tela de consentimento externa, nome **MiPede**.
3. Escopos: `openid`, `email`, `profile`.
4. Cliente OAuth **Web application**.
5. Origens autorizadas: `https://mipede-web.vercel.app` e `http://localhost:3000`.
6. Redirect URIs exatamente os callbacks acima.

Não solicitar Drive, Gmail, contatos, calendário nem acesso offline.

## Secrets

Não cole as chaves no chat. No Worker:

```bash
pnpm exec wrangler secret put GOOGLE_CLIENT_ID --env staging --config workers/control-api/wrangler.toml
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET --env staging --config workers/control-api/wrangler.toml
pnpm exec wrangler secret put GOOGLE_CLIENT_ID --env production --config workers/control-api/wrangler.toml
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET --env production --config workers/control-api/wrangler.toml
```

Use clientes separados de staging e produção quando possível.

## Fluxo

1. Aceite dos termos (cadastro) grava cookie HttpOnly de aceite.
2. O navegador chama `/api/mipede/auth/sign-in/social` no mesmo domínio. O Better Auth grava o cookie `state` e o registro em `verification`.
3. O BFF devolve cada `Set-Cookie` separado e preserva `code`/`state` no callback.
4. Google devolve o callback no BFF do mesmo domínio e do mesmo D1.
5. Sessão Better Auth no D1.
6. `/auth/continuar` pergunta o destino no servidor.
7. Sem loja → onboarding. Com loja → admin/gestor. `platform_admin` → plataforma.

Convites de equipe ficam desligados até existir um canal seguro de e-mail.
