import {
  canViewOrders,
  canWriteCatalog,
  canWriteCoupons,
  canWriteSettings,
  ignoreClientStoreId,
  isAllowedTrackingDestination,
  normalizeCouponCode,
  sniffImageMime,
} from "../../../src/server/catalog-policy";
import { groupHasEnoughOptions, validateComplementRules } from "../../../src/lib/complement-rules";
import { reaisToCents, slugifyName } from "../../../src/server/onboarding-store";
import {
  categoryWriteSchema,
  complementGroupWriteSchema,
  complementOptionWriteSchema,
  couponWriteSchema,
  deliverySettingsWriteSchema,
  productWriteSchema,
  storeSettingsWriteSchema,
  trackingLinkWriteSchema,
} from "../../../src/server/schemas";
import type { AuthContext, StoreRole } from "../../../src/server/roles";

export type AppEnv = {
  DB: D1Database;
  APP_DB?: D1Database;
  MEDIA?: R2Bucket;
  APP_PUBLIC_URL?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function friendly(error: string, status = 400) {
  const messages: Record<string, string> = {
    app_db_unconfigured: "O banco operacional ainda não está disponível.",
    forbidden: "Você não tem permissão para esta ação.",
    not_found: "Registro não encontrado.",
    invalid_input: "Revise os dados informados.",
    category_required: "Selecione uma categoria válida da sua loja.",
    coupon_exists: "Já existe um cupom com este código.",
    image_rejected: "Envie uma imagem JPG, PNG ou WebP de até 2 MB.",
    store_missing: "Nenhum estabelecimento encontrado para esta conta.",
    coming_soon: "Este cardápio ainda não está disponível.",
  };
  return json({ error, message: messages[error] ?? "Não foi possível concluir a ação." }, status);
}

function appDb(env: AppEnv) {
  return env.APP_DB ?? null;
}

function publicOrigin(env: AppEnv) {
  return (env.APP_PUBLIC_URL ?? "https://mipede-web.vercel.app").replace(/\/$/, "");
}

function membership(context: AuthContext) {
  return context.memberships[0] ?? null;
}

function requireWrite(context: AuthContext, kind: "catalog" | "settings" | "coupons") {
  const role = membership(context)?.role ?? null;
  const ok =
    kind === "catalog" ? canWriteCatalog(role) : kind === "settings" ? canWriteSettings(role) : canWriteCoupons(role);
  return ok;
}

export async function provisionStore(env: AppEnv, storeId: string): Promise<{ ok: boolean; status: string; slug: string }> {
  const db = appDb(env);
  const store = await env.DB.prepare(
    `SELECT id, name, slug, status, description, whatsapp, city, state, hours_label, prep_minutes, min_order, delivery_own, pickup, dine_in, payments, delivery_area, archived_at
     FROM stores WHERE id = ?`,
  )
    .bind(storeId)
    .first<{
      id: string;
      name: string;
      slug: string;
      status: string;
      description: string | null;
      whatsapp: string | null;
      city: string | null;
      state: string | null;
      hours_label: string | null;
      prep_minutes: number | null;
      min_order: number | null;
      delivery_own: number | null;
      pickup: number | null;
      dine_in: number | null;
      payments: string | null;
      delivery_area: string | null;
      archived_at: number | null;
    }>();
  if (!store || store.archived_at) return { ok: false, status: "FAILED", slug: "" };
  if (!db) {
    await env.DB.prepare(`UPDATE stores SET provisioning_status = 'FAILED', updated_at = ? WHERE id = ?`)
      .bind(Date.now(), storeId)
      .run();
    return { ok: false, status: "FAILED", slug: store.slug };
  }

  const existing = await db.prepare(`SELECT store_id, slug FROM store_settings WHERE store_id = ?`).bind(storeId).first<{ store_id: string; slug: string }>();
  if (existing) {
    await env.DB.prepare(`UPDATE stores SET provisioning_status = 'READY', updated_at = ? WHERE id = ?`)
      .bind(Date.now(), storeId)
      .run();
    return { ok: true, status: "READY", slug: existing.slug };
  }

  const payments = (store.payments ?? "").split(",").map((item) => item.trim());
  const now = Date.now();
  try {
    await db
      .prepare(
        `INSERT INTO store_settings (
          store_id, slug, name, description, whatsapp, phone, min_order_cents, is_open, hours_label, timezone,
          address_line, city, state, delivery_own, pickup, dine_in, delivery_fee_cents, eta_minutes, free_delivery_cents,
          delivery_area, pay_cash, pay_pix, pay_debit, pay_credit, change_needed, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, 1, ?, 'America/Bahia', NULL, ?, ?, ?, ?, ?, 0, ?, NULL, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
      )
      .bind(
        store.id,
        store.slug,
        store.name,
        store.description,
        store.whatsapp,
        reaisToCents(Number(store.min_order ?? 0)),
        store.hours_label,
        store.city,
        store.state,
        store.delivery_own ?? 1,
        store.pickup ?? 1,
        store.dine_in ?? 0,
        store.prep_minutes,
        store.delivery_area,
        payments.includes("DINHEIRO") ? 1 : 0,
        payments.includes("PIX") ? 1 : 1,
        payments.includes("CARTAO") ? 1 : 0,
        payments.includes("CARTAO") ? 1 : 0,
        1,
        now,
        now,
      )
      .run();
    await env.DB.prepare(`UPDATE stores SET provisioning_status = 'READY', updated_at = ? WHERE id = ?`)
      .bind(now, storeId)
      .run();
    return { ok: true, status: "READY", slug: store.slug };
  } catch {
    await env.DB.prepare(`UPDATE stores SET provisioning_status = 'FAILED', updated_at = ? WHERE id = ?`)
      .bind(Date.now(), storeId)
      .run();
    return { ok: false, status: "FAILED", slug: store.slug };
  }
}

export async function backfillActiveStores(env: AppEnv) {
  const rows = await env.DB.prepare(
    `SELECT id FROM stores WHERE status = 'ACTIVE' AND archived_at IS NULL AND provisioning_status != 'READY'`,
  ).all<{ id: string }>();
  const results = [];
  for (const row of rows.results ?? []) {
    results.push(await provisionStore(env, row.id));
  }
  return results;
}

export async function handleAppApi(
  request: Request,
  env: AppEnv,
  context: AuthContext | null,
  url: URL,
): Promise<Response | null> {
  const path = url.pathname.replace(/\/$/, "");

  const publicProductMatch = path.match(/^\/api\/mipede\/v1\/public\/menu\/([^/]+)\/products\/([^/]+)$/);
  if (publicProductMatch && request.method === "GET") {
    return publicProduct(env, publicProductMatch[1], publicProductMatch[2], url.searchParams.get("preview") === "1" ? context : null);
  }
  if (path.startsWith("/api/mipede/v1/public/menu/") && request.method === "GET") {
    return publicMenu(env, path.split("/").at(-1) ?? "", url.searchParams.get("preview") === "1" ? context : null);
  }
  if (path.startsWith("/api/mipede/v1/media/") && request.method === "GET") {
    return serveMedia(env, path);
  }

  if (!path.startsWith("/api/mipede/v1/catalog") &&
      !path.startsWith("/api/mipede/v1/settings") &&
      !path.startsWith("/api/mipede/v1/tracking-links") &&
      !path.startsWith("/api/mipede/v1/orders") &&
      !path.startsWith("/api/mipede/v1/customers") &&
      !path.startsWith("/api/mipede/v1/performance") &&
      path !== "/api/mipede/v1/media" &&
      path !== "/api/mipede/v1/store-link") {
    return null;
  }

  if (!context) return friendly("forbidden", 401);
  const member = membership(context);
  if (!member) return friendly("store_missing", 403);
  const db = appDb(env);
  if (!db) return friendly("app_db_unconfigured", 503);
  await provisionStore(env, member.storeId);

  if (path === "/api/mipede/v1/store-link" && request.method === "GET") {
    const settings = await db.prepare(`SELECT slug, name FROM store_settings WHERE store_id = ?`).bind(member.storeId).first<{ slug: string; name: string }>();
    const slug = settings?.slug ?? member.storeSlug;
    const href = `${publicOrigin(env)}/loja/${slug}`;
    return json({ href, slug, name: settings?.name ?? "", public: member.storeStatus === "ACTIVE" });
  }

  if (path === "/api/mipede/v1/catalog/categories") {
    if (request.method === "GET") return listCategories(db, member.storeId);
    if (request.method === "POST") {
      if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
      return createCategory(db, member.storeId, await readBody(request));
    }
  }
  const categoryMatch = path.match(/^\/api\/mipede\/v1\/catalog\/categories\/([^/]+)$/);
  if (categoryMatch && request.method === "PATCH") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return updateCategory(db, member.storeId, categoryMatch[1], await readBody(request));
  }
  if (categoryMatch && request.method === "POST" && url.searchParams.get("op") === "archive") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return archiveRow(db, "categories", member.storeId, categoryMatch[1]);
  }
  if (path.endsWith("/archive") && path.includes("/catalog/categories/")) {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return archiveRow(db, "categories", member.storeId, path.split("/").at(-2) ?? "");
  }

  if (path === "/api/mipede/v1/catalog/products") {
    if (request.method === "GET") return listProducts(db, member.storeId);
    if (request.method === "POST") {
      if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
      return createProduct(db, member.storeId, await readBody(request));
    }
  }
  const productMatch = path.match(/^\/api\/mipede\/v1\/catalog\/products\/([^/]+)$/);
  if (productMatch && request.method === "PATCH") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return updateProduct(db, member.storeId, productMatch[1], await readBody(request));
  }
  if (path.match(/^\/api\/mipede\/v1\/catalog\/products\/[^/]+\/duplicate$/) && request.method === "POST") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return duplicateProduct(db, member.storeId, path.split("/").at(-2) ?? "");
  }
  if (path.match(/^\/api\/mipede\/v1\/catalog\/products\/[^/]+\/archive$/) && request.method === "POST") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return archiveRow(db, "products", member.storeId, path.split("/").at(-2) ?? "");
  }

  if (path === "/api/mipede/v1/catalog/complements") {
    if (request.method === "GET") return listGroups(db, member.storeId);
    if (request.method === "POST") {
      if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
      const created = await createGroup(db, member.storeId, await readBody(request));
      if (created.ok) await logCatalogAudit(env, context.userId, member.storeId, "complement_group_created");
      return created;
    }
  }
  const groupMatch = path.match(/^\/api\/mipede\/v1\/catalog\/complements\/([^/]+)$/);
  if (groupMatch && request.method === "PATCH") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    const updated = await updateGroup(db, member.storeId, groupMatch[1], await readBody(request));
    if (updated.ok) await logCatalogAudit(env, context.userId, member.storeId, "complement_group_updated");
    return updated;
  }
  if (path.match(/^\/api\/mipede\/v1\/catalog\/complements\/[^/]+\/archive$/) && request.method === "POST") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return archiveRow(db, "complement_groups", member.storeId, path.split("/").at(-2) ?? "");
  }
  if (path.match(/^\/api\/mipede\/v1\/catalog\/complements\/[^/]+\/options$/) && request.method === "POST") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return createOption(db, member.storeId, path.split("/").at(-2) ?? "", await readBody(request));
  }
  const optionMatch = path.match(/^\/api\/mipede\/v1\/catalog\/complements\/([^/]+)\/options\/([^/]+)$/);
  if (optionMatch && request.method === "PATCH") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return updateOption(db, member.storeId, optionMatch[1], optionMatch[2], await readBody(request));
  }
  if (path.match(/^\/api\/mipede\/v1\/catalog\/complements\/[^/]+\/options\/[^/]+\/archive$/) && request.method === "POST") {
    if (!requireWrite(context, "catalog")) return friendly("forbidden", 403);
    return archiveRow(db, "complement_options", member.storeId, path.split("/").at(-2) ?? "");
  }

  if (path === "/api/mipede/v1/catalog/coupons") {
    if (request.method === "GET") return listCoupons(db, member.storeId);
    if (request.method === "POST") {
      if (!requireWrite(context, "coupons")) return friendly("forbidden", 403);
      return createCoupon(db, member.storeId, await readBody(request));
    }
  }
  const couponMatch = path.match(/^\/api\/mipede\/v1\/catalog\/coupons\/([^/]+)$/);
  if (couponMatch && request.method === "PATCH") {
    if (!requireWrite(context, "coupons")) return friendly("forbidden", 403);
    return updateCoupon(db, member.storeId, couponMatch[1], await readBody(request));
  }
  if (path.match(/^\/api\/mipede\/v1\/catalog\/coupons\/[^/]+\/archive$/) && request.method === "POST") {
    if (!requireWrite(context, "coupons")) return friendly("forbidden", 403);
    return archiveRow(db, "coupons", member.storeId, path.split("/").at(-2) ?? "");
  }

  if (path === "/api/mipede/v1/settings") {
    if (request.method === "GET") return getSettings(db, member.storeId, member.storeSlug, member.storeStatus);
    if (request.method === "PUT") {
      if (!requireWrite(context, "settings")) return friendly("forbidden", 403);
      return updateSettings(db, member.storeId, await readBody(request));
    }
  }
  if (path === "/api/mipede/v1/settings/delivery") {
    if (request.method === "GET") return getSettings(db, member.storeId, member.storeSlug, member.storeStatus);
    if (request.method === "PUT") {
      if (!requireWrite(context, "settings")) return friendly("forbidden", 403);
      return updateDelivery(db, member.storeId, await readBody(request));
    }
  }

  if (path === "/api/mipede/v1/tracking-links") {
    if (request.method === "GET") return listTracking(db, member.storeId, member.storeSlug, publicOrigin(env));
    if (request.method === "POST") {
      if (!requireWrite(context, "settings")) return friendly("forbidden", 403);
      return createTracking(db, member.storeId, member.storeSlug, await readBody(request));
    }
  }
  if (path.match(/^\/api\/mipede\/v1\/tracking-links\/[^/]+$/) && request.method === "PATCH") {
    if (!requireWrite(context, "settings")) return friendly("forbidden", 403);
    return toggleTracking(db, member.storeId, path.split("/").at(-1) ?? "", await readBody(request));
  }
  if (path.match(/^\/api\/mipede\/v1\/tracking-links\/[^/]+\/archive$/) && request.method === "POST") {
    if (!requireWrite(context, "settings")) return friendly("forbidden", 403);
    return archiveRow(db, "tracking_links", member.storeId, path.split("/").at(-2) ?? "");
  }

  if (path === "/api/mipede/v1/orders" && request.method === "GET") {
    if (!canViewOrders(member.role as StoreRole)) return friendly("forbidden", 403);
    return listOrders(db, member.storeId);
  }
  if (path === "/api/mipede/v1/customers" && request.method === "GET") {
    return listCustomers(db, member.storeId);
  }
  if (path === "/api/mipede/v1/performance" && request.method === "GET") {
    return performance(db, member.storeId);
  }

  if (path === "/api/mipede/v1/media" && request.method === "POST") {
    if (!requireWrite(context, "settings")) return friendly("forbidden", 403);
    return uploadMedia(env, member.storeId, request);
  }

  return json({ error: "not_found" }, 404);
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  return ignoreClientStoreId((await request.json().catch(() => ({}))) as Record<string, unknown>);
}

async function listCategories(db: D1Database, storeId: string) {
  const rows = await db
    .prepare(
      `SELECT c.id, c.name, c.description, c.sort_order as sortOrder, c.active, c.created_at as createdAt,
              (SELECT COUNT(*) FROM products p WHERE p.store_id = c.store_id AND p.category_id = c.id AND p.archived_at IS NULL) as productCount
       FROM categories c WHERE c.store_id = ? AND c.archived_at IS NULL ORDER BY c.sort_order, c.created_at`,
    )
    .bind(storeId)
    .all();
  return json({ categories: rows.results ?? [] });
}

async function createCategory(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = categoryWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO categories (id, store_id, name, description, sort_order, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, storeId, parsed.data.name, parsed.data.description ?? null, parsed.data.sortOrder ?? 0, parsed.data.active === false ? 0 : 1, now, now)
    .run();
  return json({ ok: true, id });
}

async function updateCategory(db: D1Database, storeId: string, id: string, body: Record<string, unknown>) {
  const parsed = categoryWriteSchema.partial().safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const current = await db.prepare(`SELECT id FROM categories WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first();
  if (!current) return friendly("not_found", 404);
  await db
    .prepare(
      `UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), sort_order = COALESCE(?, sort_order),
       active = COALESCE(?, active), updated_at = ? WHERE id = ? AND store_id = ?`,
    )
    .bind(
      parsed.data.name ?? null,
      parsed.data.description ?? null,
      parsed.data.sortOrder ?? null,
      parsed.data.active == null ? null : parsed.data.active ? 1 : 0,
      Date.now(),
      id,
      storeId,
    )
    .run();
  return json({ ok: true });
}

async function listProducts(db: D1Database, storeId: string) {
  const rows = await db
    .prepare(
      `SELECT p.id, p.name, p.description, p.category_id as categoryId, c.name as categoryName, p.price_cents as priceCents,
              p.promo_price_cents as promoPriceCents, p.image_key as imageKey, p.active, p.featured, p.sort_order as sortOrder
       FROM products p LEFT JOIN categories c ON c.id = p.category_id AND c.store_id = p.store_id
       WHERE p.store_id = ? AND p.archived_at IS NULL ORDER BY p.sort_order, p.created_at`,
    )
    .bind(storeId)
    .all();
  const links = await db.prepare(`SELECT product_id as productId, group_id as groupId FROM product_complement_groups WHERE store_id = ?`).bind(storeId).all<{ productId: string; groupId: string }>();
  return json({
    products: (rows.results ?? []).map((product) => ({
      ...product,
      complementGroupIds: (links.results ?? [])
        .filter((link) => link.productId === (product as { id: string }).id)
        .map((link) => link.groupId),
    })),
  });
}

async function createProduct(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = productWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  if (parsed.data.promoPriceCents != null && parsed.data.promoPriceCents > parsed.data.priceCents) return friendly("invalid_input");
  const category = await db
    .prepare(`SELECT id FROM categories WHERE id = ? AND store_id = ? AND archived_at IS NULL`)
    .bind(parsed.data.categoryId, storeId)
    .first();
  if (!category) return friendly("category_required");
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO products (id, store_id, category_id, name, description, price_cents, promo_price_cents, image_key, active, featured, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      storeId,
      parsed.data.categoryId,
      parsed.data.name,
      parsed.data.description ?? null,
      parsed.data.priceCents,
      parsed.data.promoPriceCents ?? null,
      parsed.data.imageKey ?? null,
      parsed.data.active === false ? 0 : 1,
      parsed.data.featured ? 1 : 0,
      parsed.data.sortOrder ?? 0,
      now,
      now,
    )
    .run();
  const linked = await linkGroups(db, storeId, id, parsed.data.complementGroupIds ?? []);
  if (linked) return linked;
  return json({ ok: true, id });
}

async function updateProduct(db: D1Database, storeId: string, id: string, body: Record<string, unknown>) {
  const parsed = productWriteSchema.partial().safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const current = await db.prepare(`SELECT id FROM products WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first();
  if (!current) return friendly("not_found", 404);
  if (parsed.data.categoryId) {
    const category = await db
      .prepare(`SELECT id FROM categories WHERE id = ? AND store_id = ? AND archived_at IS NULL`)
      .bind(parsed.data.categoryId, storeId)
      .first();
    if (!category) return friendly("category_required");
  }
  await db
    .prepare(
      `UPDATE products SET name = COALESCE(?, name), description = COALESCE(?, description), category_id = COALESCE(?, category_id),
       price_cents = COALESCE(?, price_cents), promo_price_cents = COALESCE(?, promo_price_cents), image_key = COALESCE(?, image_key),
       active = COALESCE(?, active), featured = COALESCE(?, featured), sort_order = COALESCE(?, sort_order), updated_at = ?
       WHERE id = ? AND store_id = ?`,
    )
    .bind(
      parsed.data.name ?? null,
      parsed.data.description ?? null,
      parsed.data.categoryId ?? null,
      parsed.data.priceCents ?? null,
      parsed.data.promoPriceCents ?? null,
      parsed.data.imageKey ?? null,
      parsed.data.active == null ? null : parsed.data.active ? 1 : 0,
      parsed.data.featured == null ? null : parsed.data.featured ? 1 : 0,
      parsed.data.sortOrder ?? null,
      Date.now(),
      id,
      storeId,
    )
    .run();
  if (parsed.data.complementGroupIds) {
    const linked = await linkGroups(db, storeId, id, parsed.data.complementGroupIds);
    if (linked) return linked;
  }
  return json({ ok: true });
}

async function duplicateProduct(db: D1Database, storeId: string, id: string) {
  const row = await db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first<Record<string, unknown>>();
  if (!row) return friendly("not_found", 404);
  const nextId = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO products (id, store_id, category_id, name, description, price_cents, promo_price_cents, image_key, active, featured, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(nextId, storeId, row.category_id, `${String(row.name)} (cópia)`, row.description, row.price_cents, row.promo_price_cents, row.image_key, 0, 0, row.sort_order, now, now)
    .run();
  const links = await db.prepare(`SELECT group_id FROM product_complement_groups WHERE store_id = ? AND product_id = ?`).bind(storeId, id).all<{ group_id: string }>();
  const linked = await linkGroups(db, storeId, nextId, (links.results ?? []).map((item) => item.group_id));
  if (linked) return linked;
  return json({ ok: true, id: nextId });
}

async function linkGroups(db: D1Database, storeId: string, productId: string, groupIds: string[]) {
  await db.prepare(`DELETE FROM product_complement_groups WHERE store_id = ? AND product_id = ?`).bind(storeId, productId).run();
  let order = 0;
  for (const groupId of groupIds) {
    const group = await db
      .prepare(
        `SELECT id, min_select as minSelect,
                (SELECT COUNT(*) FROM complement_options o WHERE o.group_id = complement_groups.id AND o.store_id = complement_groups.store_id AND o.archived_at IS NULL AND o.active = 1) as activeOptions
         FROM complement_groups WHERE id = ? AND store_id = ? AND archived_at IS NULL`,
      )
      .bind(groupId, storeId)
      .first<{ id: string; minSelect: number; activeOptions: number }>();
    if (!group) return friendly("not_found", 404);
    if (!groupHasEnoughOptions(group.minSelect, group.activeOptions)) {
      return json({ error: "group_not_ready", message: "Este grupo ainda não tem opções suficientes para o mínimo configurado." }, 400);
    }
    await db
      .prepare(`INSERT INTO product_complement_groups (store_id, product_id, group_id, sort_order) VALUES (?, ?, ?, ?)`)
      .bind(storeId, productId, groupId, order)
      .run();
    order += 1;
  }
  return null;
}

async function listGroups(db: D1Database, storeId: string) {
  const groups = await db
    .prepare(
      `SELECT id, name, required, min_select as minSelect, max_select as maxSelect, active, sort_order as sortOrder
       FROM complement_groups WHERE store_id = ? AND archived_at IS NULL ORDER BY sort_order, created_at`,
    )
    .bind(storeId)
    .all();
  const options = await db
    .prepare(
      `SELECT id, group_id as groupId, name, price_cents as priceCents, active, sort_order as sortOrder
       FROM complement_options WHERE store_id = ? AND archived_at IS NULL ORDER BY sort_order`,
    )
    .bind(storeId)
    .all();
  const links = await db.prepare(`SELECT product_id as productId, group_id as groupId FROM product_complement_groups WHERE store_id = ?`).bind(storeId).all();
  return json({
    groups: (groups.results ?? []).map((group) => ({
      ...group,
      options: (options.results ?? []).filter((option) => option.groupId === (group as { id: string }).id),
      productIds: (links.results ?? [])
        .filter((link) => (link as { groupId: string }).groupId === (group as { id: string }).id)
        .map((link) => (link as { productId: string }).productId),
    })),
  });
}

async function createGroup(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = complementGroupWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const minSelect = parsed.data.minSelect ?? (parsed.data.required ? 1 : 0);
  const maxSelect = parsed.data.maxSelect ?? 1;
  const invalid = validateComplementRules({ required: Boolean(parsed.data.required), minSelect, maxSelect });
  if (invalid) return json({ error: "invalid_input", message: invalid.message, field: invalid.field }, 400);
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO complement_groups (id, store_id, name, required, min_select, max_select, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, storeId, parsed.data.name, parsed.data.required ? 1 : 0, minSelect, maxSelect, parsed.data.active === false ? 0 : 1, parsed.data.sortOrder ?? 0, now, now)
    .run();
  return json({ ok: true, id });
}

async function updateGroup(db: D1Database, storeId: string, id: string, body: Record<string, unknown>) {
  const parsed = complementGroupWriteSchema.partial().safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const current = await db
    .prepare(`SELECT id, required, min_select as minSelect, max_select as maxSelect FROM complement_groups WHERE id = ? AND store_id = ? AND archived_at IS NULL`)
    .bind(id, storeId)
    .first<{ id: string; required: number; minSelect: number; maxSelect: number }>();
  if (!current) return friendly("not_found", 404);
  const nextRequired = parsed.data.required ?? Boolean(current.required);
  const nextMin = parsed.data.minSelect ?? current.minSelect;
  const nextMax = parsed.data.maxSelect ?? current.maxSelect;
  const invalid = validateComplementRules({ required: nextRequired, minSelect: nextMin, maxSelect: nextMax });
  if (invalid) return json({ error: "invalid_input", message: invalid.message, field: invalid.field }, 400);
  await db
    .prepare(
      `UPDATE complement_groups SET name = COALESCE(?, name), required = COALESCE(?, required), min_select = COALESCE(?, min_select),
       max_select = COALESCE(?, max_select), active = COALESCE(?, active), sort_order = COALESCE(?, sort_order), updated_at = ?
       WHERE id = ? AND store_id = ?`,
    )
    .bind(
      parsed.data.name ?? null,
      parsed.data.required == null ? null : parsed.data.required ? 1 : 0,
      parsed.data.minSelect ?? null,
      parsed.data.maxSelect ?? null,
      parsed.data.active == null ? null : parsed.data.active ? 1 : 0,
      parsed.data.sortOrder ?? null,
      Date.now(),
      id,
      storeId,
    )
    .run();
  if (parsed.data.productIds) {
    await db.prepare(`DELETE FROM product_complement_groups WHERE store_id = ? AND group_id = ?`).bind(storeId, id).run();
    for (const [index, productId] of parsed.data.productIds.entries()) {
      const product = await db.prepare(`SELECT id FROM products WHERE id = ? AND store_id = ?`).bind(productId, storeId).first();
      if (!product) continue;
      await db
        .prepare(`INSERT INTO product_complement_groups (store_id, product_id, group_id, sort_order) VALUES (?, ?, ?, ?)`)
        .bind(storeId, productId, id, index)
        .run();
    }
  }
  return json({ ok: true });
}

async function createOption(db: D1Database, storeId: string, groupId: string, body: Record<string, unknown>) {
  const parsed = complementOptionWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const group = await db.prepare(`SELECT id FROM complement_groups WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(groupId, storeId).first();
  if (!group) return friendly("not_found", 404);
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO complement_options (id, store_id, group_id, name, price_cents, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, storeId, groupId, parsed.data.name, parsed.data.priceCents ?? 0, parsed.data.active === false ? 0 : 1, parsed.data.sortOrder ?? 0, now, now)
    .run();
  return json({ ok: true, id });
}

async function updateOption(db: D1Database, storeId: string, groupId: string, id: string, body: Record<string, unknown>) {
  const parsed = complementOptionWriteSchema.partial().safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const current = await db
    .prepare(`SELECT id FROM complement_options WHERE id = ? AND group_id = ? AND store_id = ? AND archived_at IS NULL`)
    .bind(id, groupId, storeId)
    .first();
  if (!current) return friendly("not_found", 404);
  await db
    .prepare(
      `UPDATE complement_options SET name = COALESCE(?, name), price_cents = COALESCE(?, price_cents), active = COALESCE(?, active),
       sort_order = COALESCE(?, sort_order), updated_at = ? WHERE id = ? AND store_id = ?`,
    )
    .bind(
      parsed.data.name ?? null,
      parsed.data.priceCents ?? null,
      parsed.data.active == null ? null : parsed.data.active ? 1 : 0,
      parsed.data.sortOrder ?? null,
      Date.now(),
      id,
      storeId,
    )
    .run();
  return json({ ok: true });
}

async function listCoupons(db: D1Database, storeId: string) {
  const rows = await db
    .prepare(
      `SELECT id, code, name, type, value, min_order_cents as minOrderCents, max_discount_cents as maxDiscountCents,
              starts_at as startsAt, ends_at as endsAt, usage_limit as usageLimit, per_customer_limit as perCustomerLimit,
              new_customers_only as newCustomersOnly, active
       FROM coupons WHERE store_id = ? AND archived_at IS NULL ORDER BY created_at DESC`,
    )
    .bind(storeId)
    .all();
  return json({ coupons: rows.results ?? [], metrics: { active: (rows.results ?? []).filter((item) => (item as { active: number }).active).length, uses: 0, revenueCents: 0 } });
}

async function createCoupon(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = couponWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  if (parsed.data.type === "percent" && parsed.data.value > 100) return friendly("invalid_input");
  if (parsed.data.startsAt && parsed.data.endsAt && parsed.data.endsAt < parsed.data.startsAt) return friendly("invalid_input");
  const code = normalizeCouponCode(parsed.data.code);
  const id = crypto.randomUUID();
  const now = Date.now();
  try {
    await db
      .prepare(
        `INSERT INTO coupons (id, store_id, code, name, type, value, min_order_cents, max_discount_cents, starts_at, ends_at, usage_limit, per_customer_limit, new_customers_only, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        storeId,
        code,
        parsed.data.name,
        parsed.data.type,
        parsed.data.value,
        parsed.data.minOrderCents ?? 0,
        parsed.data.maxDiscountCents ?? null,
        parsed.data.startsAt ?? null,
        parsed.data.endsAt ?? null,
        parsed.data.usageLimit ?? null,
        parsed.data.perCustomerLimit ?? null,
        parsed.data.newCustomersOnly ? 1 : 0,
        parsed.data.active === false ? 0 : 1,
        now,
        now,
      )
      .run();
  } catch {
    return friendly("coupon_exists", 409);
  }
  return json({ ok: true, id, code });
}

async function updateCoupon(db: D1Database, storeId: string, id: string, body: Record<string, unknown>) {
  const parsed = couponWriteSchema.partial().safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  const current = await db.prepare(`SELECT id FROM coupons WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first();
  if (!current) return friendly("not_found", 404);
  await db
    .prepare(
      `UPDATE coupons SET name = COALESCE(?, name), type = COALESCE(?, type), value = COALESCE(?, value),
       min_order_cents = COALESCE(?, min_order_cents), max_discount_cents = COALESCE(?, max_discount_cents),
       starts_at = COALESCE(?, starts_at), ends_at = COALESCE(?, ends_at), usage_limit = COALESCE(?, usage_limit),
       per_customer_limit = COALESCE(?, per_customer_limit), new_customers_only = COALESCE(?, new_customers_only),
       active = COALESCE(?, active), updated_at = ? WHERE id = ? AND store_id = ?`,
    )
    .bind(
      parsed.data.name ?? null,
      parsed.data.type ?? null,
      parsed.data.value ?? null,
      parsed.data.minOrderCents ?? null,
      parsed.data.maxDiscountCents ?? null,
      parsed.data.startsAt ?? null,
      parsed.data.endsAt ?? null,
      parsed.data.usageLimit ?? null,
      parsed.data.perCustomerLimit ?? null,
      parsed.data.newCustomersOnly == null ? null : parsed.data.newCustomersOnly ? 1 : 0,
      parsed.data.active == null ? null : parsed.data.active ? 1 : 0,
      Date.now(),
      id,
      storeId,
    )
    .run();
  return json({ ok: true });
}

async function getSettings(db: D1Database, storeId: string, fallbackSlug: string, status: string) {
  const row = await db.prepare(`SELECT * FROM store_settings WHERE store_id = ?`).bind(storeId).first();
  return json({ settings: row ?? { store_id: storeId, slug: fallbackSlug }, publicHref: `/loja/${(row as { slug?: string } | null)?.slug ?? fallbackSlug}`, status });
}

async function updateSettings(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = storeSettingsWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  await db
    .prepare(
      `UPDATE store_settings SET name = COALESCE(?, name), description = COALESCE(?, description), whatsapp = COALESCE(?, whatsapp),
       phone = COALESCE(?, phone), min_order_cents = COALESCE(?, min_order_cents), hours_label = COALESCE(?, hours_label),
       is_open = COALESCE(?, is_open), address_line = COALESCE(?, address_line), city = COALESCE(?, city), state = COALESCE(?, state),
       logo_key = COALESCE(?, logo_key), cover_key = COALESCE(?, cover_key), version = version + 1, updated_at = ?
       WHERE store_id = ?`,
    )
    .bind(
      parsed.data.name ?? null,
      parsed.data.description ?? null,
      parsed.data.whatsapp ?? null,
      parsed.data.phone ?? null,
      parsed.data.minOrderCents ?? null,
      parsed.data.hoursLabel ?? null,
      parsed.data.isOpen == null ? null : parsed.data.isOpen ? 1 : 0,
      parsed.data.addressLine ?? null,
      parsed.data.city ?? null,
      parsed.data.state ?? null,
      parsed.data.logoKey ?? null,
      parsed.data.coverKey ?? null,
      Date.now(),
      storeId,
    )
    .run();
  if (parsed.data.name) {
    await db.prepare(`UPDATE store_settings SET name = ? WHERE store_id = ?`).bind(parsed.data.name, storeId).run();
  }
  return json({ ok: true });
}

async function updateDelivery(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = deliverySettingsWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  await db
    .prepare(
      `UPDATE store_settings SET delivery_own = COALESCE(?, delivery_own), pickup = COALESCE(?, pickup), dine_in = COALESCE(?, dine_in),
       delivery_fee_cents = COALESCE(?, delivery_fee_cents), eta_minutes = COALESCE(?, eta_minutes), min_order_cents = COALESCE(?, min_order_cents),
       free_delivery_cents = COALESCE(?, free_delivery_cents), delivery_area = COALESCE(?, delivery_area), pay_cash = COALESCE(?, pay_cash),
       pay_pix = COALESCE(?, pay_pix), pay_debit = COALESCE(?, pay_debit), pay_credit = COALESCE(?, pay_credit), change_needed = COALESCE(?, change_needed),
       version = version + 1, updated_at = ? WHERE store_id = ?`,
    )
    .bind(
      parsed.data.deliveryOwn == null ? null : parsed.data.deliveryOwn ? 1 : 0,
      parsed.data.pickup == null ? null : parsed.data.pickup ? 1 : 0,
      parsed.data.dineIn == null ? null : parsed.data.dineIn ? 1 : 0,
      parsed.data.deliveryFeeCents ?? null,
      parsed.data.etaMinutes ?? null,
      parsed.data.minOrderCents ?? null,
      parsed.data.freeDeliveryCents ?? null,
      parsed.data.deliveryArea ?? null,
      parsed.data.payCash == null ? null : parsed.data.payCash ? 1 : 0,
      parsed.data.payPix == null ? null : parsed.data.payPix ? 1 : 0,
      parsed.data.payDebit == null ? null : parsed.data.payDebit ? 1 : 0,
      parsed.data.payCredit == null ? null : parsed.data.payCredit ? 1 : 0,
      parsed.data.changeNeeded == null ? null : parsed.data.changeNeeded ? 1 : 0,
      Date.now(),
      storeId,
    )
    .run();
  return json({ ok: true });
}

async function listTracking(db: D1Database, storeId: string, slug: string, origin: string) {
  const rows = await db
    .prepare(
      `SELECT id, name, token, origin, medium, campaign, content, destination, active, clicks, sessions, carts, orders, revenue_cents as revenueCents
       FROM tracking_links WHERE store_id = ? AND archived_at IS NULL ORDER BY created_at DESC`,
    )
    .bind(storeId)
    .all();
  return json({
    defaultHref: `${origin}/loja/${slug}`,
    links: (rows.results ?? []).map((item) => ({
      ...item,
      href: `${origin}/loja/${slug}?utm=${(item as { token: string }).token}`,
    })),
  });
}

async function createTracking(db: D1Database, storeId: string, slug: string, body: Record<string, unknown>) {
  const parsed = trackingLinkWriteSchema.safeParse(body);
  if (!parsed.success) return friendly("invalid_input");
  if (!isAllowedTrackingDestination(parsed.data.destination, slug)) return friendly("invalid_input");
  const id = crypto.randomUUID();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO tracking_links (id, store_id, name, token, origin, medium, campaign, content, destination, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .bind(id, storeId, parsed.data.name, token, parsed.data.origin, parsed.data.medium ?? null, parsed.data.campaign ?? null, parsed.data.content ?? null, parsed.data.destination, now, now)
    .run();
  return json({ ok: true, id, token });
}

async function toggleTracking(db: D1Database, storeId: string, id: string, body: Record<string, unknown>) {
  const current = await db.prepare(`SELECT id FROM tracking_links WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first();
  if (!current) return friendly("not_found", 404);
  const active = body.active === false ? 0 : 1;
  await db.prepare(`UPDATE tracking_links SET active = ?, updated_at = ? WHERE id = ? AND store_id = ?`).bind(active, Date.now(), id, storeId).run();
  return json({ ok: true });
}

async function listOrders(db: D1Database, storeId: string) {
  const rows = await db
    .prepare(`SELECT id, status, total_cents as totalCents, created_at as createdAt FROM orders WHERE store_id = ? AND archived_at IS NULL ORDER BY created_at DESC LIMIT 100`)
    .bind(storeId)
    .all();
  return json({ orders: rows.results ?? [] });
}

async function listCustomers(db: D1Database, storeId: string) {
  const rows = await db
    .prepare(
      `SELECT id, name, phone_masked as phoneMasked, orders_count as ordersCount, spent_cents as spentCents, last_order_at as lastOrderAt
       FROM customers WHERE store_id = ? AND archived_at IS NULL ORDER BY created_at DESC LIMIT 100`,
    )
    .bind(storeId)
    .all();
  return json({
    customers: rows.results ?? [],
    metrics: { total: (rows.results ?? []).length, newCustomers: 0, recurring: 0, averageTicketCents: 0 },
  });
}

async function performance(db: D1Database, storeId: string) {
  const orders = await db.prepare(`SELECT COUNT(*) as n, COALESCE(SUM(total_cents), 0) as revenue FROM orders WHERE store_id = ?`).bind(storeId).first<{ n: number; revenue: number }>();
  return json({
    finishedOrders: orders?.n ?? 0,
    revenueCents: orders?.revenue ?? 0,
    averageTicketCents: orders?.n ? Math.round((orders.revenue ?? 0) / orders.n) : 0,
    customers: 0,
    funnel: { visits: 0, product: 0, cart: 0, checkout: 0, orders: orders?.n ?? 0 },
    series: [],
  });
}

async function archiveRow(db: D1Database, table: string, storeId: string, id: string) {
  const allowed = new Set(["categories", "products", "complement_groups", "complement_options", "coupons", "tracking_links"]);
  if (!allowed.has(table) || !id) return friendly("not_found", 404);
  const result = await db.prepare(`UPDATE ${table} SET archived_at = ?, updated_at = ? WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(Date.now(), Date.now(), id, storeId).run();
  if (!result.meta.changes) return friendly("not_found", 404);
  return json({ ok: true });
}

async function uploadMedia(env: AppEnv, storeId: string, request: Request) {
  if (!env.MEDIA || !env.APP_DB) return friendly("app_db_unconfigured", 503);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return friendly("image_rejected");
  if (file.size > 2 * 1024 * 1024) return friendly("image_rejected");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageMime(bytes);
  if (!mime) return friendly("image_rejected");
  const id = crypto.randomUUID();
  const key = `${storeId}/${id}`;
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: mime } });
  await env.APP_DB.prepare(`INSERT INTO media_objects (id, store_id, object_key, mime, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(id, storeId, key, mime, bytes.byteLength, Date.now()).run();
  return json({ ok: true, key, url: `/api/mipede/v1/media/${storeId}/${id}` });
}

async function serveMedia(env: AppEnv, path: string) {
  const parts = path.split("/");
  const storeId = parts.at(-2) ?? "";
  const fileId = parts.at(-1) ?? "";
  if (!env.MEDIA || !storeId || !fileId) return new Response("Not found", { status: 404 });
  const object = await env.MEDIA.get(`${storeId}/${fileId}`);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  headers.set("content-type", object.httpMetadata?.contentType ?? "application/octet-stream");
  headers.set("cache-control", "public, max-age=86400");
  return new Response(object.body, { headers });
}

async function publicMenu(env: AppEnv, slug: string, previewContext: AuthContext | null) {
  if (!slug || slug.length < 3) return friendly("not_found", 404);
  const store = await env.DB.prepare(
    `SELECT id, name, slug, status, archived_at FROM stores WHERE slug = ?`,
  )
    .bind(slug)
    .first<{ id: string; name: string; slug: string; status: string; archived_at: number | null }>();
  if (!store || store.archived_at) return friendly("not_found", 404);
  const isOwnerPreview =
    previewContext?.memberships.some((item) => item.storeId === store.id) ?? false;
  if (store.status !== "ACTIVE" && !isOwnerPreview) {
    return json({
      comingSoon: true,
      store: { name: store.name, slug: store.slug, status: "coming_soon" },
      categories: [],
      products: [],
    });
  }
  const db = appDb(env);
  if (!db) {
    return json({
      comingSoon: store.status !== "ACTIVE",
      store: { name: store.name, slug: store.slug, status: store.status === "ACTIVE" ? "open" : "preparing" },
      categories: [],
      products: [],
      emptyMessage: "Este cardápio ainda não possui itens disponíveis.",
    });
  }
  await provisionStore(env, store.id);
  const settings = await db.prepare(`SELECT * FROM store_settings WHERE store_id = ?`).bind(store.id).first<Record<string, unknown>>();
  const categories = await db
    .prepare(
      `SELECT id, name, description, sort_order as sortOrder FROM categories WHERE store_id = ? AND archived_at IS NULL AND active = 1 ORDER BY sort_order`,
    )
    .bind(store.id)
    .all();
  const products = await db
    .prepare(
      `SELECT id, category_id as categoryId, name, description, price_cents as priceCents, promo_price_cents as promoPriceCents, image_key as imageKey, featured
       FROM products WHERE store_id = ? AND archived_at IS NULL AND active = 1 ORDER BY sort_order`,
    )
    .bind(store.id)
    .all();
  const groups = await db
    .prepare(
      `SELECT g.id, g.name, g.required, g.min_select as minSelect, g.max_select as maxSelect, l.product_id as productId
       FROM product_complement_groups l
       JOIN complement_groups g ON g.id = l.group_id AND g.store_id = l.store_id
       WHERE l.store_id = ? AND g.archived_at IS NULL AND g.active = 1`,
    )
    .bind(store.id)
    .all();
  const options = await db
    .prepare(
      `SELECT id, group_id as groupId, name, price_cents as priceCents FROM complement_options WHERE store_id = ? AND archived_at IS NULL AND active = 1 ORDER BY sort_order`,
    )
    .bind(store.id)
    .all();
  return json({
    comingSoon: false,
    store: {
      name: (settings?.name as string) ?? store.name,
      slug: (settings?.slug as string) ?? store.slug,
      description: settings?.description ?? null,
      whatsapp: settings?.whatsapp ?? null,
      hoursLabel: settings?.hours_label ?? null,
      address: settings?.address_line ?? null,
      city: settings?.city ?? null,
      state: settings?.state ?? null,
      minOrderCents: settings?.min_order_cents ?? 0,
      isOpen: settings?.is_open === 1,
      logoUrl: settings?.logo_key ? `/api/mipede/v1/media/${store.id}/${String(settings.logo_key).split("/").at(-1)}` : null,
      coverUrl: settings?.cover_key ? `/api/mipede/v1/media/${store.id}/${String(settings.cover_key).split("/").at(-1)}` : null,
      status: settings?.is_open === 1 ? "open" : "closed",
    },
    categories: categories.results ?? [],
    products: (products.results ?? []).map((product) => ({
      ...product,
      imageUrl: (product as { imageKey?: string }).imageKey
        ? `/api/mipede/v1/media/${store.id}/${String((product as { imageKey: string }).imageKey).split("/").at(-1)}`
        : null,
      complements: (groups.results ?? [])
        .filter((group) => (group as { productId: string }).productId === (product as { id: string }).id)
        .map((group) => ({
          id: (group as { id: string }).id,
          name: (group as { name: string }).name,
          required: Boolean((group as { required: number }).required),
          type: (group as { required: number }).required ? "required" : "optional",
          minSelect: (group as { minSelect: number }).minSelect,
          maxSelect: (group as { maxSelect: number }).maxSelect,
          options: (options.results ?? []).filter((option) => (option as { groupId: string }).groupId === (group as { id: string }).id),
        })),
    })),
    emptyMessage: "Este cardápio ainda não possui itens disponíveis.",
  });
}

async function publicProduct(env: AppEnv, slug: string, productId: string, previewContext: AuthContext | null) {
  const menu = await publicMenu(env, slug, previewContext);
  if (!menu.ok) return menu;
  const payload = (await menu.json()) as {
    comingSoon?: boolean;
    products?: Array<Record<string, unknown> & { id: string }>;
  };
  if (payload.comingSoon) return json({ error: "not_found", message: "Produto indisponível" }, 404);
  const product = (payload.products ?? []).find((item) => item.id === productId);
  if (!product) return json({ error: "not_found", message: "Produto indisponível" }, 404);
  return json({ product });
}

async function logCatalogAudit(env: AppEnv, actorId: string, storeId: string, action: string) {
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, actor_user_id, organization_id, store_id, action, resource_type, resource_id, metadata_safe, ip_hash, user_agent_summary, created_at)
     VALUES (?, ?, NULL, ?, ?, 'catalog', ?, NULL, NULL, NULL, ?)`,
  )
    .bind(crypto.randomUUID(), actorId, storeId, action, storeId, Date.now())
    .run()
    .catch(() => undefined);
}

export function publicStoreSlugFromName(name: string) {
  return slugifyName(name);
}
