import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

import { isEmailPasswordAuthEnabled, isGoogleAuthEnabled, isPasswordAuthPath, PASSWORD_AUTH_UNAVAILABLE } from "../../../src/server/auth-flags";
import { authorizePlatform, authorizeStoreAccess, rejectRoleEscalation } from "../../../src/server/authorize";
import { MemoryRateLimiter } from "../../../src/server/rate-limit";
import { resolvePostAuthDestination } from "../../../src/server/redirects";
import { PRIVACY_VERSION, TERMS_INTENT_COOKIE, TERMS_INTENT_MAX_AGE, TERMS_VERSION } from "../../../src/server/terms";
import {
  canAccessPlatform,
  isValidSlug,
  rejectMassAssignment,
  type AuthContext,
  type StoreRole,
  type StoreStatus,
} from "../../../src/server/roles";
import {
  forgotPasswordSchema,
  loginSchema,
  onboardingCompanySchema,
  onboardingIdentitySchema,
  onboardingOperationSchema,
  platformDecisionSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../../src/server/schemas";

export interface ControlEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  APP_PUBLIC_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  PLATFORM_ADMIN_EMAILS?: string;
  TRUSTED_ORIGINS?: string;
  MIPEDE_BFF_SHARED_SECRET?: string;
  ALLOW_TEST_EMAIL_BYPASS?: string;
  ENVIRONMENT?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MIPEDE_EMAIL_PASSWORD_AUTH_ENABLED?: string;
  MIPEDE_GOOGLE_AUTH_ENABLED?: string;
}

const limiter = new MemoryRateLimiter(8, 60_000);

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return diff === 0;
}

function trustedOrigins(env: ControlEnv): string[] {
  return (env.TRUSTED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item !== "*" && !item.includes("*"));
}

function publicAuthRequest(request: Request, env: ControlEnv, incoming: URL): Request {
  const origin =
    request.headers.get("x-mipede-public-origin") ||
    env.BETTER_AUTH_URL ||
    env.APP_PUBLIC_URL ||
    "https://mipede-web.vercel.app";
  const publicUrl = new URL(`${incoming.pathname}${incoming.search}`, origin.endsWith("/") ? origin : `${origin}/`);
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: request.headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }
  return new Request(publicUrl.toString(), init);
}

function hasValidBffSecret(request: Request, env: ControlEnv): boolean {
  const expected = env.MIPEDE_BFF_SHARED_SECRET;
  if (!expected) return env.ENVIRONMENT === "development";
  return timingSafeEqual(request.headers.get("x-mipede-bff-secret") ?? "", expected);
}

function isTrustedOrigin(env: ControlEnv, request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET" || request.method === "HEAD";
  return trustedOrigins(env).includes(origin);
}

function isPlatformEmail(env: ControlEnv, email: string): boolean {
  return (env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(env: ControlEnv, token: string | undefined, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return env.ALLOW_TEST_EMAIL_BYPASS === "1" && Boolean(token);
  }
  if (!token) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  const payload = (await response.json()) as { success?: boolean };
  return payload.success === true;
}

async function sendEmail(env: ControlEnv, to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY) {
    if (env.ALLOW_TEST_EMAIL_BYPASS === "1") return;
    throw new Error("email_unconfigured");
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL ?? "MiPede <nao-responda@mipede.app>",
      to,
      subject,
      html,
    }),
  });
}

function passwordEnabled(env: ControlEnv): boolean {
  return isEmailPasswordAuthEnabled(env.MIPEDE_EMAIL_PASSWORD_AUTH_ENABLED);
}

function googleEnabled(env: ControlEnv): boolean {
  return isGoogleAuthEnabled(env.MIPEDE_GOOGLE_AUTH_ENABLED) && Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

function createAuth(env: ControlEnv) {
  if (!env.BETTER_AUTH_SECRET || !env.DB) return null;
  const db = new Kysely({
    dialect: new D1Dialect({ database: env.DB }),
  });
  const google = googleEnabled(env);

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? env.APP_PUBLIC_URL ?? "http://localhost:3000",
    basePath: "/api/mipede/auth",
    trustedOrigins: trustedOrigins(env),
    database: {
      db,
      type: "sqlite",
    },
    emailAndPassword: {
      enabled: passwordEnabled(env),
      requireEmailVerification: true,
      minPasswordLength: 10,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        if (!passwordEnabled(env) || !env.RESEND_API_KEY) return;
        await sendEmail(
          env,
          user.email,
          "Redefinir senha — MiPede",
          `<p>Use o link enviado para redefinir sua senha. Ele expira em breve.</p><p><a href="${url}">Redefinir senha</a></p>`,
        );
      },
    },
    emailVerification: {
      sendOnSignUp: passwordEnabled(env),
      sendVerificationEmail: async ({ user, url }) => {
        if (!passwordEnabled(env) || !env.RESEND_API_KEY) return;
        await sendEmail(
          env,
          user.email,
          "Confirme seu e-mail — MiPede",
          `<p>Confirme seu e-mail para continuar o cadastro da sua loja.</p><p><a href="${url}">Verificar e-mail</a></p>`,
        );
      },
    },
    socialProviders: google
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {},
    account: {
      accountLinking: {
        enabled: true,
        disableImplicitLinking: false,
        allowDifferentEmails: false,
        // Usuários de testes sem Resend ficaram com emailVerified=0.
        // O Google ainda precisa devolver email_verified; sem trustedProviders
        // o Better Auth recusa o vínculo se o Google não confirmar o e-mail.
        requireLocalEmailVerified: false,
      },
    },
    user: {
      additionalFields: {
        whatsapp: { type: "string", required: false },
      },
    },
    advanced: {
      useSecureCookies: true,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        creatorRole: "owner",
      }),
    ],
  });
}

async function hasGoogleAccount(env: ControlEnv, userId: string): Promise<boolean> {
  const row = await env.DB.prepare(`SELECT providerId FROM account WHERE userId = ? AND providerId = ?`)
    .bind(userId, "google")
    .first<{ providerId: string }>();
  return Boolean(row);
}

async function loadContext(env: ControlEnv, userId: string, email: string, verified: boolean): Promise<AuthContext> {
  const googleAccount = await hasGoogleAccount(env, userId);
  const members = await env.DB.prepare(
    `SELECT m.organizationId, m.role, s.id as storeId, s.slug as storeSlug, s.status as storeStatus
     FROM member m
     LEFT JOIN stores s ON s.organization_id = m.organizationId
     WHERE m.userId = ?`,
  )
    .bind(userId)
    .all<{
      organizationId: string;
      role: StoreRole;
      storeId: string;
      storeSlug: string;
      storeStatus: StoreStatus;
    }>();

  return {
    userId,
    email,
    emailVerified: verified || googleAccount,
    platformRole: isPlatformEmail(env, email) ? "platform_admin" : null,
    memberships: (members.results ?? [])
      .filter((item) => item.storeId)
      .map((item) => ({
        organizationId: item.organizationId,
        storeId: item.storeId,
        storeSlug: item.storeSlug,
        storeStatus: item.storeStatus,
        role: item.role,
      })),
  };
}

async function writeAudit(
  env: ControlEnv,
  input: {
    actor?: string;
    organizationId?: string;
    storeId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ip?: string;
    ua?: string;
  },
) {
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, actor_user_id, organization_id, store_id, action, resource_type, resource_id, metadata_safe, ip_hash, user_agent_summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      input.actor ?? null,
      input.organizationId ?? null,
      input.storeId ?? null,
      input.action,
      input.resourceType,
      input.resourceId ?? null,
      null,
      input.ip ? await sha256(input.ip) : null,
      input.ua ? input.ua.slice(0, 80) : null,
      Date.now(),
    )
    .run();
}

async function sessionContext(request: Request, env: ControlEnv) {
  const auth = createAuth(env);
  if (!auth) return null;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  const email = session.user.email;
  return {
    auth,
    session,
    context: await loadContext(env, session.user.id, email, Boolean(session.user.emailVerified)),
  };
}

function rateLimit(key: string) {
  const result = limiter.consume(key);
  if (!result.ok) {
    return json({ error: "rate_limited" }, 429, { "retry-after": String(result.retryAfter) });
  }
  return null;
}

export default {
  async fetch(request: Request, env: ControlEnv): Promise<Response> {
    const url = new URL(request.url);
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "0.0.0.0";

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: "mipede-control",
        version: "07.1",
        environment: env.ENVIRONMENT ?? "unknown",
      });
    }

    if (!hasValidBffSecret(request, env)) {
      return json({ error: "forbidden" }, 403);
    }

    if (!passwordEnabled(env) && (isPasswordAuthPath(url.pathname) || ["/api/mipede/v1/register", "/api/mipede/v1/login", "/api/mipede/v1/forgot-password", "/api/mipede/v1/reset-password"].includes(url.pathname))) {
      return json({ error: PASSWORD_AUTH_UNAVAILABLE }, 403);
    }

    if (url.pathname === "/api/mipede/v1/auth/methods" && request.method === "GET") {
      return json({
        google: googleEnabled(env),
        password: passwordEnabled(env),
      });
    }

    if (url.pathname === "/api/mipede/v1/auth/google/start" && request.method === "POST") {
      const blocked = rateLimit(`google:${ip}`);
      if (blocked) return blocked;
      if (!googleEnabled(env)) return json({ error: PASSWORD_AUTH_UNAVAILABLE }, 403);
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      if (body.role === "platform_admin" || body.isPlatformAdmin) return json({ error: "forbidden_role" }, 403);
      const forbidden = rejectMassAssignment(body, ["acceptTerms", "acceptPrivacy"]);
      if (forbidden.length) return json({ error: "mass_assignment", fields: forbidden }, 400);
      if (body.acceptTerms !== true || body.acceptPrivacy !== true) {
        return json({ error: "terms_required" }, 400);
      }
      const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
      headers.append(
        "set-cookie",
        `${TERMS_INTENT_COOKIE}=${TERMS_VERSION}|${PRIVACY_VERSION}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${TERMS_INTENT_MAX_AGE}`,
      );
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    if (url.pathname === "/api/mipede/v1/auth/destination" && request.method === "GET") {
      const current = await sessionContext(request, env);
      if (!current) return json({ error: "unauthenticated" }, 401);
      const cookieHeader = request.headers.get("cookie") ?? "";
      const intent = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${TERMS_INTENT_COOKIE}=`))
        ?.slice(TERMS_INTENT_COOKIE.length + 1);
      if (intent === `${TERMS_VERSION}|${PRIVACY_VERSION}`) {
        try {
          await env.DB.prepare(
            `INSERT INTO terms_acceptances (id, user_id, terms_version, privacy_version, ip_hash, user_agent_summary, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
            .bind(
              crypto.randomUUID(),
              current.context.userId,
              TERMS_VERSION,
              PRIVACY_VERSION,
              await sha256(ip),
              (request.headers.get("user-agent") ?? "").slice(0, 80),
              Date.now(),
            )
            .run();
          await writeAudit(env, {
            actor: current.context.userId,
            action: "terms_accepted",
            resourceType: "user",
            resourceId: current.context.userId,
            ip,
            ua: request.headers.get("user-agent") ?? undefined,
          });
        } catch {
          // Tabela ainda não migrada não pode impedir o login Google.
        }
      }
      if (current.context.platformRole === "platform_admin") {
        await writeAudit(env, {
          actor: current.context.userId,
          action: "platform_admin_recognized",
          resourceType: "user",
          resourceId: current.context.userId,
          ip,
          ua: request.headers.get("user-agent") ?? undefined,
        });
      }
      const store = current.context.memberships[0]
        ? await env.DB.prepare(`SELECT slug, status, onboarding_status FROM stores WHERE id = ?`)
            .bind(current.context.memberships[0].storeId)
            .first<{ slug: string; status: StoreStatus; onboarding_status: string }>()
        : null;
      const path = resolvePostAuthDestination({
        platformAdmin: current.context.platformRole === "platform_admin",
        store: store
          ? {
              slug: store.slug,
              role: current.context.memberships[0].role,
              status: store.status,
              onboardingStatus: store.onboarding_status,
            }
          : null,
        requested: url.searchParams.get("next"),
      });
      return json({ path });
    }

    if (!env.BETTER_AUTH_SECRET) {
      return json(
        {
          error: "control_api_unconfigured",
          message: "Worker sem BETTER_AUTH_SECRET. Configure os secrets antes de autenticar.",
        },
        503,
      );
    }

    if (request.method !== "GET" && request.method !== "HEAD" && !isTrustedOrigin(env, request)) {
      return json({ error: "csrf_rejected" }, 403);
    }

    if (url.pathname.startsWith("/api/mipede/auth/")) {
      const auth = createAuth(env);
      if (!auth) return json({ error: "auth_unavailable" }, 503);
      return auth.handler(publicAuthRequest(request, env, url));
    }

    if (url.pathname === "/api/mipede/v1/register" && request.method === "POST") {
      const blocked = rateLimit(`register:${ip}`);
      if (blocked) return blocked;
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const forbidden = rejectMassAssignment(body, [
        "name",
        "email",
        "whatsapp",
        "password",
        "confirmPassword",
        "acceptTerms",
        "acceptPrivacy",
        "turnstileToken",
      ]);
      if (forbidden.length) return json({ error: "mass_assignment", fields: forbidden }, 400);
      if (body.role === "platform_admin" || body.isPlatformAdmin) {
        return json({ error: "forbidden_role" }, 403);
      }
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) return json({ error: "invalid_input", issues: parsed.error.flatten() }, 400);
      if (!(await verifyTurnstile(env, parsed.data.turnstileToken, ip))) {
        return json({ error: "turnstile_failed" }, 400);
      }
      const auth = createAuth(env);
      if (!auth) return json({ error: "auth_unavailable" }, 503);
      try {
        await auth.api.signUpEmail({
          body: {
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
            whatsapp: parsed.data.whatsapp,
          },
        });
      } catch {
        return json({ error: "register_failed" }, 400);
      }
      await writeAudit(env, { action: "register", resourceType: "user", ip, ua: request.headers.get("user-agent") ?? undefined });
      return json({ ok: true, next: "/verificar-email" });
    }

    if (url.pathname === "/api/mipede/v1/login" && request.method === "POST") {
      const blocked = rateLimit(`login:${ip}`);
      if (blocked) return blocked;
      const parsed = loginSchema.safeParse(await request.json().catch(() => ({})));
      if (!parsed.success) return json({ error: "invalid_input" }, 400);
      if (parsed.data.turnstileToken && !(await verifyTurnstile(env, parsed.data.turnstileToken, ip))) {
        return json({ error: "turnstile_failed" }, 400);
      }
      const auth = createAuth(env);
      if (!auth) return json({ error: "auth_unavailable" }, 503);
      try {
        const result = await auth.api.signInEmail({
          body: { email: parsed.data.email, password: parsed.data.password },
          headers: request.headers,
          asResponse: true,
        });
        return result;
      } catch {
        return json({ error: "invalid_credentials" }, 401);
      }
    }

    if (url.pathname === "/api/mipede/v1/forgot-password" && request.method === "POST") {
      const blocked = rateLimit(`forgot:${ip}`);
      if (blocked) return blocked;
      const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => ({})));
      if (!parsed.success) return json({ error: "invalid_input" }, 400);
      if (!(await verifyTurnstile(env, parsed.data.turnstileToken, ip))) {
        return json({ error: "turnstile_failed" }, 400);
      }
      const auth = createAuth(env);
      if (!auth) return json({ error: "auth_unavailable" }, 503);
      try {
        await auth.api.forgetPassword({ body: { email: parsed.data.email } });
      } catch {
        // Resposta uniforme para não revelar existência do e-mail.
      }
      return json({ ok: true });
    }

    if (url.pathname === "/api/mipede/v1/reset-password" && request.method === "POST") {
      const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => ({})));
      if (!parsed.success) return json({ error: "invalid_input" }, 400);
      const auth = createAuth(env);
      if (!auth) return json({ error: "auth_unavailable" }, 503);
      try {
        await auth.api.resetPassword({ body: { token: parsed.data.token, newPassword: parsed.data.password } });
      } catch {
        return json({ error: "reset_failed" }, 400);
      }
      return json({ ok: true });
    }

    if (url.pathname === "/api/mipede/v1/me" && request.method === "GET") {
      const current = await sessionContext(request, env);
      if (!current) return json({ user: null }, 200);
      const storeRow = current.context.memberships[0]
        ? await env.DB.prepare(
            `SELECT id, name, slug, status, onboarding_status, organization_id FROM stores WHERE id = ?`,
          )
            .bind(current.context.memberships[0].storeId)
            .first<{
              id: string;
              name: string;
              slug: string;
              status: StoreStatus;
              onboarding_status: string;
              organization_id: string;
            }>()
        : null;
      return json({
        user: {
          id: current.context.userId,
          name: current.session.user.name,
          email: current.context.email,
          emailVerified: current.context.emailVerified,
        },
        platformRole: current.context.platformRole,
        store: storeRow
          ? {
              organizationId: storeRow.organization_id,
              storeId: storeRow.id,
              name: storeRow.name,
              slug: storeRow.slug,
              status: storeRow.status,
              onboardingStatus: storeRow.onboarding_status,
              role: current.context.memberships[0].role,
            }
          : null,
      });
    }

    if (url.pathname.startsWith("/api/mipede/v1/onboarding/") && request.method === "POST") {
      const current = await sessionContext(request, env);
      if (!current) return json({ error: "unauthenticated" }, 401);
      if (!current.context.emailVerified && env.ALLOW_TEST_EMAIL_BYPASS !== "1") {
        return json({ error: "email_unverified" }, 403);
      }

      const step = url.pathname.split("/").at(-1);
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

      if (step === "company") {
        const forbidden = rejectMassAssignment(body, [
          "name",
          "segment",
          "whatsapp",
          "responsible",
          "cnpj",
          "city",
          "state",
          "slug",
        ]);
        if (forbidden.length) return json({ error: "mass_assignment", fields: forbidden }, 400);
        const parsed = onboardingCompanySchema.safeParse(body);
        if (!parsed.success) return json({ error: "invalid_input", issues: parsed.error.flatten() }, 400);
        if (!isValidSlug(parsed.data.slug)) return json({ error: "reserved_or_invalid_slug" }, 400);
        const existing = await env.DB.prepare(`SELECT id FROM stores WHERE slug = ?`).bind(parsed.data.slug).first();
        if (existing) return json({ error: "slug_taken" }, 409);

        const organizationId = crypto.randomUUID();
        const storeId = crypto.randomUUID();
        const now = Date.now();
        await env.DB.prepare(
          `INSERT INTO organization (id, name, slug, createdAt, metadata) VALUES (?, ?, ?, ?, ?)`,
        )
          .bind(organizationId, parsed.data.name, parsed.data.slug, now, null)
          .run();
        await env.DB.prepare(`INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)`)
          .bind(crypto.randomUUID(), organizationId, current.context.userId, "owner", now)
          .run();
        await env.DB.prepare(
          `INSERT INTO stores (id, organization_id, name, slug, status, onboarding_status, provisioning_status, owner_user_id, business_type, whatsapp, city, state, cnpj, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'DRAFT', 'company', 'NOT_STARTED', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            storeId,
            organizationId,
            parsed.data.name,
            parsed.data.slug,
            current.context.userId,
            parsed.data.segment,
            parsed.data.whatsapp,
            parsed.data.city,
            parsed.data.state,
            parsed.data.cnpj ?? null,
            now,
            now,
          )
          .run();
        await writeAudit(env, {
          actor: current.context.userId,
          organizationId,
          storeId,
          action: "onboarding_company",
          resourceType: "store",
          resourceId: storeId,
          ip,
          ua: request.headers.get("user-agent") ?? undefined,
        });
        return json({ ok: true, organizationId, storeId, slug: parsed.data.slug });
      }

      const membership = current.context.memberships[0];
      if (!membership) return json({ error: "store_missing" }, 400);

      if (step === "operation") {
        const parsed = onboardingOperationSchema.safeParse(body);
        if (!parsed.success) return json({ error: "invalid_input" }, 400);
        await env.DB.prepare(
          `UPDATE stores SET delivery_own = ?, pickup = ?, dine_in = ?, hours_label = ?, prep_minutes = ?, min_order = ?, payments = ?, delivery_area = ?, onboarding_status = 'operation', updated_at = ? WHERE id = ? AND organization_id = ?`,
        )
          .bind(
            parsed.data.deliveryOwn ? 1 : 0,
            parsed.data.pickup ? 1 : 0,
            parsed.data.dineIn ? 1 : 0,
            parsed.data.hoursLabel,
            parsed.data.prepMinutes,
            parsed.data.minOrder,
            parsed.data.payments.join(","),
            parsed.data.deliveryArea ?? null,
            Date.now(),
            membership.storeId,
            membership.organizationId,
          )
          .run();
        return json({ ok: true });
      }

      if (step === "identity") {
        const parsed = onboardingIdentitySchema.safeParse(body);
        if (!parsed.success) return json({ error: "invalid_input" }, 400);
        await env.DB.prepare(
          `UPDATE stores SET description = ?, primary_color = ?, onboarding_status = 'identity', updated_at = ? WHERE id = ? AND organization_id = ?`,
        )
          .bind(parsed.data.description ?? null, parsed.data.primaryColor, Date.now(), membership.storeId, membership.organizationId)
          .run();
        return json({ ok: true });
      }

      if (step === "submit") {
        await env.DB.prepare(
          `UPDATE stores SET status = 'PENDING_REVIEW', onboarding_status = 'submitted', updated_at = ? WHERE id = ? AND organization_id = ? AND status = 'DRAFT'`,
        )
          .bind(Date.now(), membership.storeId, membership.organizationId)
          .run();
        await writeAudit(env, {
          actor: current.context.userId,
          organizationId: membership.organizationId,
          storeId: membership.storeId,
          action: "onboarding_submit",
          resourceType: "store",
          resourceId: membership.storeId,
          ip,
          ua: request.headers.get("user-agent") ?? undefined,
        });
        return json({ ok: true, next: "/admin/desempenho" });
      }

      return json({ error: "unknown_step" }, 404);
    }

    if (url.pathname === "/api/mipede/v1/platform/stores" && request.method === "GET") {
      const current = await sessionContext(request, env);
      const decision = authorizePlatform(current?.context ?? null);
      if (!decision.ok) return json({ error: decision.error }, decision.status);
      const rows = await env.DB.prepare(
        `SELECT s.id, s.name, s.slug, s.status, s.onboarding_status, s.provisioning_status, s.city, s.created_at, u.name as owner_name, u.email as owner_email
         FROM stores s
         LEFT JOIN user u ON u.id = s.owner_user_id
         ORDER BY s.created_at DESC`,
      ).all();
      return json({ stores: rows.results ?? [] });
    }

    if (url.pathname.startsWith("/api/mipede/v1/platform/stores/") && request.method === "POST") {
      const current = await sessionContext(request, env);
      const decision = authorizePlatform(current?.context ?? null);
      if (!decision.ok) return json({ error: decision.error }, decision.status);
      const parsed = platformDecisionSchema.safeParse(await request.json().catch(() => ({})));
      if (!parsed.success) return json({ error: "invalid_input" }, 400);
      const storeId = url.pathname.split("/").at(-1);
      const status =
        parsed.data.action === "approve"
          ? "APPROVED"
          : parsed.data.action === "reject"
            ? "REJECTED"
            : parsed.data.action === "suspend"
              ? "SUSPENDED"
              : "ACTIVE";
      await env.DB.prepare(
        `UPDATE stores SET status = ?, approved_at = ?, approved_by = ?, rejection_reason = ?, updated_at = ? WHERE id = ?`,
      )
        .bind(
          status,
          parsed.data.action === "approve" ? Date.now() : null,
          current?.context.userId ?? null,
          parsed.data.reason ?? null,
          Date.now(),
          storeId,
        )
        .run();
      await writeAudit(env, {
        actor: current?.context.userId,
        action: parsed.data.action,
        resourceType: "store",
        resourceId: storeId,
        ip,
        ua: request.headers.get("user-agent") ?? undefined,
      });
      return json({ ok: true, status });
    }

    if (url.pathname === "/api/mipede/v1/authorize" && request.method === "POST") {
      const current = await sessionContext(request, env);
      if (!current) return json({ error: "unauthenticated" }, 401);
      const body = (await request.json().catch(() => ({}))) as {
        storeId?: string;
        organizationId?: string;
        slug?: string;
        requestedRole?: string;
        action?: "view" | "operate" | "manage" | "view_finance" | "transfer_ownership";
      };
      if (rejectRoleEscalation(current.context.memberships[0]?.role ?? "operator", body.requestedRole)) {
        return json({ error: "forbidden" }, 403);
      }
      if (body.requestedRole === "platform_admin" && !canAccessPlatform(current.context)) {
        return json({ error: "forbidden" }, 403);
      }
      const decision = authorizeStoreAccess(current.context, body, body.action ?? "view");
      if (!decision.ok) return json({ error: decision.error }, decision.status);
      return json({ store: decision.store, role: decision.store.role, platform: decision.platform });
    }

    return json({ error: "not_found" }, 404);
  },
};
