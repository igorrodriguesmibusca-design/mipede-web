import {
  decryptPii,
  decodeKey,
  encryptPii,
  generateInviteToken,
  hashEmailLookup,
  hashInviteToken,
  maskEmail,
} from "../../../src/server/pii-crypto";
import {
  auditActionForStore,
  canAcceptInvite,
  canBootstrapOwner,
  canPerformPlatformAction,
  storeStatusAfterDecision,
  type PlatformAdminRecord,
} from "../../../src/server/platform-policy";
import type { PlatformRole } from "../../../src/server/roles";
export type PlatformEnv = {
  DB: D1Database;
  PLATFORM_ADMIN_EMAILS?: string;
  MIPEDE_PII_ENCRYPTION_KEY?: string;
  MIPEDE_EMAIL_LOOKUP_KEY?: string;
};

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function cryptoKeys(env: PlatformEnv) {
  const enc = decodeKey(env.MIPEDE_PII_ENCRYPTION_KEY);
  const lookup = decodeKey(env.MIPEDE_EMAIL_LOOKUP_KEY);
  if (!enc || !lookup) return null;
  return { enc, lookup };
}

export async function loadPlatformAdmin(env: PlatformEnv, userId: string): Promise<PlatformAdminRecord | null> {
  const row = await env.DB.prepare(`SELECT user_id, role, status FROM platform_administrators WHERE user_id = ?`)
    .bind(userId)
    .first<{ user_id: string; role: PlatformRole; status: "active" | "suspended" }>();
  if (!row) return null;
  return { userId: row.user_id, role: row.role, status: row.status };
}

export async function loadPlatformRole(env: PlatformEnv, userId: string): Promise<PlatformRole | null> {
  const admin = await loadPlatformAdmin(env, userId);
  if (!admin || admin.status !== "active") return null;
  return admin.role;
}

export async function hasPlatformOwner(env: PlatformEnv): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT id FROM platform_administrators WHERE role = 'platform_owner' AND status = 'active' LIMIT 1`,
  ).first();
  return Boolean(row);
}

export async function canBootstrapFlag(env: PlatformEnv, email: string, verified: boolean): Promise<boolean> {
  return canBootstrapOwner({
    hasOwner: await hasPlatformOwner(env),
    emailVerified: verified,
    sessionEmail: email,
    allowlist: (env.PLATFORM_ADMIN_EMAILS ?? "").split(","),
  }).ok;
}

async function touchAccess(env: PlatformEnv, userId: string) {
  await env.DB.prepare(`UPDATE platform_administrators SET last_access_at = ?, updated_at = ? WHERE user_id = ?`)
    .bind(Date.now(), Date.now(), userId)
    .run();
}

export async function requirePlatform(
  env: PlatformEnv,
  userId: string,
  action: Parameters<typeof canPerformPlatformAction>[1],
  target?: Parameters<typeof canPerformPlatformAction>[2],
) {
  const actor = await loadPlatformAdmin(env, userId);
  const decision = canPerformPlatformAction(actor, action, target);
  if (decision.ok) await touchAccess(env, userId);
  return decision;
}

export async function bootstrapOwner(
  env: PlatformEnv,
  input: { userId: string; email: string; name: string; verified: boolean },
) {
  const keys = cryptoKeys(env);
  if (!keys) return json({ error: "crypto_unconfigured" }, 503);
  const allowed = canBootstrapOwner({
    hasOwner: await hasPlatformOwner(env),
    emailVerified: input.verified,
    sessionEmail: input.email,
    allowlist: (env.PLATFORM_ADMIN_EMAILS ?? "").split(","),
  });
  if (!allowed.ok) return json({ error: allowed.error }, allowed.error === "already_bootstrapped" ? 409 : 403);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO platform_administrators (id, user_id, encrypted_name, encrypted_email, normalized_email_hash, role, status, created_by, created_at, updated_at, last_access_at, key_version)
     VALUES (?, ?, ?, ?, ?, 'platform_owner', 'active', ?, ?, ?, ?, 'v1')`,
  )
    .bind(
      crypto.randomUUID(),
      input.userId,
      await encryptPii(keys.enc, input.name || "Igor Rodrigues"),
      await encryptPii(keys.enc, input.email),
      await hashEmailLookup(keys.lookup, input.email),
      input.userId,
      now,
      now,
      now,
    )
    .run();
  return json({ ok: true, role: "platform_owner" });
}

export async function dashboard(env: PlatformEnv) {
  const pending = await env.DB.prepare(`SELECT COUNT(*) as n FROM stores WHERE status = 'PENDING_REVIEW'`).first<{ n: number }>();
  const active = await env.DB.prepare(`SELECT COUNT(*) as n FROM stores WHERE status = 'ACTIVE'`).first<{ n: number }>();
  const suspended = await env.DB.prepare(`SELECT COUNT(*) as n FROM stores WHERE status = 'SUSPENDED'`).first<{ n: number }>();
  const admins = await env.DB.prepare(`SELECT COUNT(*) as n FROM platform_administrators WHERE status = 'active'`).first<{ n: number }>();
  const invites = await env.DB.prepare(`SELECT COUNT(*) as n FROM platform_admin_invitations WHERE status = 'pending'`).first<{ n: number }>();
  const audit = await env.DB.prepare(
    `SELECT id, action, resource_type, resource_id, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 8`,
  ).all();
  return json({
    pending: pending?.n ?? 0,
    active: active?.n ?? 0,
    suspended: suspended?.n ?? 0,
    admins: admins?.n ?? 0,
    invites: invites?.n ?? 0,
    recent: audit.results ?? [],
  });
}

export async function listStores(env: PlatformEnv) {
  const rows = await env.DB.prepare(
    `SELECT id, name, slug, status, onboarding_status, provisioning_status, city, created_at, owner_user_id
     FROM stores WHERE archived_at IS NULL ORDER BY created_at DESC`,
  ).all();
  return json({ stores: rows.results ?? [] });
}

export async function getStore(env: PlatformEnv, storeId: string) {
  const store = await env.DB.prepare(
    `SELECT id, name, slug, status, onboarding_status, provisioning_status, city, state, created_at, approved_at, approved_by, rejection_reason, owner_user_id
     FROM stores WHERE id = ?`,
  )
    .bind(storeId)
    .first();
  if (!store) return json({ error: "not_found" }, 404);
  const history = await env.DB.prepare(
    `SELECT id, action, created_at, actor_user_id FROM audit_logs WHERE store_id = ? ORDER BY created_at DESC LIMIT 20`,
  )
    .bind(storeId)
    .all();
  return json({ store, history: history.results ?? [] });
}

export async function decideStore(
  env: PlatformEnv,
  storeId: string,
  action: "approve" | "reject" | "suspend" | "reactivate",
  actorId: string,
  reason?: string,
) {
  const previous = await env.DB.prepare(`SELECT status FROM stores WHERE id = ?`).bind(storeId).first<{ status: string }>();
  if (!previous) return json({ error: "not_found" }, 404);
  const status = storeStatusAfterDecision(action);
  if (previous.status === status) {
    return json({ ok: true, status, previous: previous.status, reused: true, audit: auditActionForStore(action) });
  }
  await env.DB.prepare(
    `UPDATE stores SET status = ?, approved_at = ?, approved_by = ?, rejection_reason = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(status, action === "approve" ? Date.now() : null, actorId, reason ?? null, Date.now(), storeId)
    .run();
  return json({
    ok: true,
    status,
    previous: previous.status,
    audit: auditActionForStore(action),
  });
}

export async function listAdmins(env: PlatformEnv) {
  const keys = cryptoKeys(env);
  if (!keys) return json({ error: "crypto_unconfigured" }, 503);
  const rows = await env.DB.prepare(
    `SELECT id, user_id, encrypted_name, encrypted_email, role, status, created_by, created_at, last_access_at FROM platform_administrators ORDER BY created_at`,
  ).all<{
    id: string;
    user_id: string;
    encrypted_name: string;
    encrypted_email: string;
    role: PlatformRole;
    status: string;
    created_by: string | null;
    created_at: number;
    last_access_at: number | null;
  }>();
  const admins = [];
  for (const row of rows.results ?? []) {
    const email = await decryptPii(keys.enc, row.encrypted_email);
    const name = await decryptPii(keys.enc, row.encrypted_name);
    admins.push({
      id: row.id,
      userId: row.user_id,
      name,
      emailMasked: maskEmail(email),
      role: row.role,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      lastAccessAt: row.last_access_at,
    });
  }
  const invites = await env.DB.prepare(
    `SELECT id, encrypted_name, encrypted_email, status, created_at, expires_at, created_by FROM platform_admin_invitations ORDER BY created_at DESC`,
  ).all<{
    id: string;
    encrypted_name: string;
    encrypted_email: string;
    status: string;
    created_at: number;
    expires_at: number;
    created_by: string;
  }>();
  const pending = [];
  for (const row of invites.results ?? []) {
    const email = await decryptPii(keys.enc, row.encrypted_email);
    pending.push({
      id: row.id,
      name: await decryptPii(keys.enc, row.encrypted_name),
      emailMasked: maskEmail(email),
      status: row.status,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      createdBy: row.created_by,
    });
  }
  return json({ admins, invites: pending });
}

export async function createInvite(env: PlatformEnv, input: { name: string; email: string; createdBy: string }) {
  const keys = cryptoKeys(env);
  if (!keys) return json({ error: "crypto_unconfigured" }, 503);
  const emailHash = await hashEmailLookup(keys.lookup, input.email);
  const active = await env.DB.prepare(`SELECT id FROM platform_administrators WHERE normalized_email_hash = ? AND status = 'active'`)
    .bind(emailHash)
    .first();
  if (active) return json({ error: "already_admin" }, 409);
  const token = generateInviteToken();
  const id = crypto.randomUUID();
  const now = Date.now();
  try {
    await env.DB.prepare(
      `INSERT INTO platform_admin_invitations (id, normalized_email_hash, encrypted_email, encrypted_name, role, token_hash, status, created_by, expires_at, created_at, key_version)
       VALUES (?, ?, ?, ?, 'platform_admin', ?, 'pending', ?, ?, ?, 'v1')`,
    )
      .bind(
        id,
        emailHash,
        await encryptPii(keys.enc, input.email.trim().toLowerCase()),
        await encryptPii(keys.enc, input.name.trim()),
        await hashInviteToken(token),
        input.createdBy,
        now + INVITE_TTL_MS,
        now,
      )
      .run();
  } catch {
    return json({ error: "invite_exists" }, 409);
  }
  return json({
    ok: true,
    inviteId: id,
    url: `/plataforma/convites/${token}`,
    expiresAt: now + INVITE_TTL_MS,
  });
}

export async function revokeInvite(env: PlatformEnv, inviteId: string) {
  await env.DB.prepare(
    `UPDATE platform_admin_invitations SET status = 'revoked', revoked_at = ? WHERE id = ? AND status = 'pending'`,
  )
    .bind(Date.now(), inviteId)
    .run();
  return json({ ok: true });
}

export async function renewInvite(env: PlatformEnv, inviteId: string, createdBy: string) {
  const keys = cryptoKeys(env);
  if (!keys) return json({ error: "crypto_unconfigured" }, 503);
  const row = await env.DB.prepare(
    `SELECT encrypted_email, encrypted_name FROM platform_admin_invitations WHERE id = ?`,
  )
    .bind(inviteId)
    .first<{ encrypted_email: string; encrypted_name: string }>();
  if (!row) return json({ error: "not_found" }, 404);
  await revokeInvite(env, inviteId);
  const email = await decryptPii(keys.enc, row.encrypted_email);
  const name = await decryptPii(keys.enc, row.encrypted_name);
  return createInvite(env, { email, name, createdBy });
}

export async function acceptInvite(
  env: PlatformEnv,
  token: string,
  session: { userId: string; email: string; name: string; verified: boolean },
) {
  const keys = cryptoKeys(env);
  if (!keys) return json({ error: "crypto_unconfigured" }, 503);
  const tokenHash = await hashInviteToken(token);
  const invite = await env.DB.prepare(
    `SELECT id, normalized_email_hash, status, expires_at FROM platform_admin_invitations WHERE token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{ id: string; normalized_email_hash: string; status: "pending" | "accepted" | "expired" | "revoked"; expires_at: number }>();
  if (!invite) return json({ error: "not_found" }, 404);
  const allowed = canAcceptInvite({
    inviteStatus: invite.status,
    expiresAt: invite.expires_at,
    inviteEmailHash: invite.normalized_email_hash,
    sessionEmailHash: await hashEmailLookup(keys.lookup, session.email),
    googleVerified: session.verified,
  });
  if (!allowed.ok) return json({ error: allowed.error }, 403);
  const now = Date.now();
  const updated = await env.DB.prepare(
    `UPDATE platform_admin_invitations SET status = 'accepted', accepted_by = ?, accepted_at = ? WHERE id = ? AND status = 'pending'`,
  )
    .bind(session.userId, now, invite.id)
    .run();
  if (!updated.meta.changes) return json({ error: "reused" }, 403);
  await env.DB.prepare(
    `INSERT INTO platform_administrators (id, user_id, encrypted_name, encrypted_email, normalized_email_hash, role, status, created_by, created_at, updated_at, last_access_at, key_version)
     VALUES (?, ?, ?, ?, ?, 'platform_admin', 'active', ?, ?, ?, ?, 'v1')`,
  )
    .bind(
      crypto.randomUUID(),
      session.userId,
      await encryptPii(keys.enc, session.name || session.email),
      await encryptPii(keys.enc, session.email),
      await hashEmailLookup(keys.lookup, session.email),
      invite.id,
      now,
      now,
      now,
    )
    .run();
  return json({ ok: true, role: "platform_admin" });
}

export async function setAdminStatus(env: PlatformEnv, adminId: string, status: "active" | "suspended") {
  const row = await env.DB.prepare(`SELECT user_id, role FROM platform_administrators WHERE id = ?`)
    .bind(adminId)
    .first<{ user_id: string; role: PlatformRole }>();
  if (!row) return json({ error: "not_found" }, 404);
  if (row.role === "platform_owner") return json({ error: "forbidden" }, 403);
  await env.DB.prepare(
    `UPDATE platform_administrators SET status = ?, suspended_at = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(status, status === "suspended" ? Date.now() : null, Date.now(), adminId)
    .run();
  if (status === "suspended") {
    await env.DB.prepare(`DELETE FROM session WHERE userId = ?`).bind(row.user_id).run();
  }
  return json({ ok: true, status });
}

export async function removeAdmin(env: PlatformEnv, adminId: string, actorId: string) {
  const row = await env.DB.prepare(`SELECT user_id, role FROM platform_administrators WHERE id = ?`)
    .bind(adminId)
    .first<{ user_id: string; role: PlatformRole }>();
  if (!row) return json({ error: "not_found" }, 404);
  const owners = await env.DB.prepare(
    `SELECT COUNT(*) as n FROM platform_administrators WHERE role = 'platform_owner' AND status = 'active'`,
  ).first<{ n: number }>();
  const decision = canPerformPlatformAction(
    { userId: actorId, role: "platform_owner", status: "active" },
    "remove_admin",
    { role: row.role, userId: row.user_id, isLastOwner: (owners?.n ?? 0) <= 1 && row.role === "platform_owner" },
  );
  if (!decision.ok) return json({ error: decision.error }, decision.status);
  await env.DB.prepare(`DELETE FROM platform_administrators WHERE id = ?`).bind(adminId).run();
  return json({ ok: true });
}

export async function listAudit(env: PlatformEnv) {
  const rows = await env.DB.prepare(
    `SELECT id, actor_user_id, action, resource_type, resource_id, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 80`,
  ).all();
  return json({ logs: rows.results ?? [] });
}
