# Modelo de ameaças — fundação autenticada

O sistema **não** é “100% seguro” nem “100% criptografado”. Abaixo está o que esta etapa cobre e o que ainda não existe.

## Controles atuais

| Ameaça | Controle |
| --- | --- |
| IDOR/BOLA (trocar storeId/org/slug) | Tenant resolvido no Worker a partir da sessão. 403/404. |
| Autenticação quebrada | Better Auth, e-mail verificado, cookies HttpOnly. Sem JWT no storage. |
| Escalada de privilégio | `role` e `platform_admin` rejeitados no cadastro. Operador não vira admin. |
| Mass assignment | Schemas Zod + lista de campos proibidos. |
| SQL injection | Apenas prepared statements no D1. |
| XSS | Sem `dangerouslySetInnerHTML`. CSP no Next.js. |
| CSRF | Origens confiáveis + cookies SameSite=Lax + Better Auth. |
| Bots | Turnstile no Worker (cadastro, recuperação; login se houver token). |
| Brute force | Rate limit em cadastro, login, forgot e reenvio. |
| Vazamento em logs | Sem senha, token, cookie ou PII completa na auditoria. IP só como hash. |
| Secrets no Git | `.env*` e `.dev.vars*` ignorados. Só arquivos `.example`. |
| Preview em produção | `/preview` exige demo explícito, sessão de `platform_admin` ou desenvolvimento. |

## Ainda não implementado (fora deste prompt)

- Pedidos reais e anti-replay de pedido
- Preço/desconto/entrega calculados no servidor
- WebSockets / Durable Objects (risco de canal de outra loja)
- Criptografia adicional de PII operacional (AES-GCM + HMAC cego)
- OTP por WhatsApp
- Provisionamento automático do D1 por loja

## Criptografia existente (infraestrutura)

- D1 em repouso: AES-256 (Cloudflare)
- Tráfego Worker ↔ D1: TLS
- Senhas: hash do Better Auth
- Secrets: Wrangler Secrets / Secrets Store

Não implementar criptografia caseira sem revisão.

## Testes

Vitest cobre Loja A vs Loja B, papéis, mass assignment, slug reservado e rate limit.

Playwright cobre telas públicas, ausência de token no `localStorage` e restrição da plataforma.

Testes de segurança **não** atacam produção.
