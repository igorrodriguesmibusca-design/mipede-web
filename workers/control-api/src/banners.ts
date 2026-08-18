import { bannerDisplayStatus, bannerHref, bannerIsPublic, clampFocus, validateBannerInput } from "../../../src/lib/storefront-banners";
import { bannerWriteSchema, identityWriteSchema } from "../../../src/server/schemas";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function mediaUrl(storeId: string, mediaId: string | null | undefined) {
  return mediaId ? `/api/mipede/v1/media/${storeId}/${mediaId}` : null;
}

export async function mediaBelongsToStore(db: D1Database, storeId: string, mediaId: string | null | undefined) {
  if (!mediaId) return true;
  const row = await db.prepare(`SELECT id FROM media_objects WHERE id = ? AND store_id = ?`).bind(mediaId, storeId).first();
  return Boolean(row);
}

export function mapIdentity(storeId: string, settings: Record<string, unknown> | null) {
  const logoId = (settings?.logo_media_id as string | null) ?? null;
  const desktopId = (settings?.cover_desktop_media_id as string | null) ?? null;
  const mobileId = (settings?.cover_mobile_media_id as string | null) ?? null;
  const legacyCover = settings?.cover_key ? String(settings.cover_key).split("/").at(-1) : null;
  const legacyLogo = settings?.logo_key ? String(settings.logo_key).split("/").at(-1) : null;
  return {
    logoMediaId: logoId,
    coverDesktopMediaId: desktopId,
    coverMobileMediaId: mobileId,
    coverDesktopFocusX: Number(settings?.cover_desktop_focus_x ?? 0.5),
    coverDesktopFocusY: Number(settings?.cover_desktop_focus_y ?? 0.5),
    coverMobileFocusX: Number(settings?.cover_mobile_focus_x ?? 0.5),
    coverMobileFocusY: Number(settings?.cover_mobile_focus_y ?? 0.5),
    logoUrl: mediaUrl(storeId, logoId ?? legacyLogo),
    coverDesktopUrl: mediaUrl(storeId, desktopId ?? legacyCover),
    coverMobileUrl: mediaUrl(storeId, mobileId ?? desktopId ?? legacyCover),
    timezone: String(settings?.timezone ?? "America/Bahia"),
  };
}

export async function updateIdentity(db: D1Database, storeId: string, body: Record<string, unknown>) {
  const parsed = identityWriteSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_input", message: "Revise os dados da identidade visual." }, 400);
  for (const mediaId of [parsed.data.logoMediaId, parsed.data.coverDesktopMediaId, parsed.data.coverMobileMediaId]) {
    if (!(await mediaBelongsToStore(db, storeId, mediaId))) {
      return json({ error: "not_found", message: "A imagem não pertence a esta loja." }, 404);
    }
  }
  await db
    .prepare(
      `UPDATE store_settings SET
        logo_media_id = COALESCE(?, logo_media_id),
        cover_desktop_media_id = COALESCE(?, cover_desktop_media_id),
        cover_mobile_media_id = COALESCE(?, cover_mobile_media_id),
        cover_desktop_focus_x = COALESCE(?, cover_desktop_focus_x),
        cover_desktop_focus_y = COALESCE(?, cover_desktop_focus_y),
        cover_mobile_focus_x = COALESCE(?, cover_mobile_focus_x),
        cover_mobile_focus_y = COALESCE(?, cover_mobile_focus_y),
        version = version + 1, updated_at = ?
       WHERE store_id = ?`,
    )
    .bind(
      parsed.data.logoMediaId === undefined ? null : parsed.data.logoMediaId,
      parsed.data.coverDesktopMediaId === undefined ? null : parsed.data.coverDesktopMediaId,
      parsed.data.coverMobileMediaId === undefined ? null : parsed.data.coverMobileMediaId,
      parsed.data.coverDesktopFocusX == null ? null : clampFocus(parsed.data.coverDesktopFocusX),
      parsed.data.coverDesktopFocusY == null ? null : clampFocus(parsed.data.coverDesktopFocusY),
      parsed.data.coverMobileFocusX == null ? null : clampFocus(parsed.data.coverMobileFocusX),
      parsed.data.coverMobileFocusY == null ? null : clampFocus(parsed.data.coverMobileFocusY),
      Date.now(),
      storeId,
    )
    .run();
  if (parsed.data.logoMediaId === null) {
    await db.prepare(`UPDATE store_settings SET logo_media_id = NULL, logo_key = NULL, updated_at = ? WHERE store_id = ?`).bind(Date.now(), storeId).run();
  }
  if (parsed.data.coverDesktopMediaId === null) {
    await db.prepare(`UPDATE store_settings SET cover_desktop_media_id = NULL, cover_key = NULL, updated_at = ? WHERE store_id = ?`).bind(Date.now(), storeId).run();
  }
  if (parsed.data.coverMobileMediaId === null) {
    await db.prepare(`UPDATE store_settings SET cover_mobile_media_id = NULL, updated_at = ? WHERE store_id = ?`).bind(Date.now(), storeId).run();
  }
  const settings = await db.prepare(`SELECT * FROM store_settings WHERE store_id = ?`).bind(storeId).first<Record<string, unknown>>();
  return json({ ok: true, identity: mapIdentity(storeId, settings) });
}

type BannerRow = {
  id: string;
  internal_name: string;
  desktop_media_id: string | null;
  mobile_media_id: string | null;
  alt_text: string | null;
  placement: "hero" | "after_category" | "footer";
  after_category_id: string | null;
  target_type: "none" | "product" | "category" | "coupon" | "external";
  target_id: string | null;
  external_url: string | null;
  cta_label: string | null;
  device_scope: "both" | "desktop" | "mobile";
  sort_order: number;
  status: "draft" | "active" | "paused";
  starts_at: number | null;
  ends_at: number | null;
};

function presentBanner(storeId: string, slug: string, row: BannerRow, categoryActive: boolean, now: number) {
  return {
    id: row.id,
    internalName: row.internal_name,
    desktopMediaId: row.desktop_media_id,
    mobileMediaId: row.mobile_media_id,
    desktopUrl: mediaUrl(storeId, row.desktop_media_id),
    mobileUrl: mediaUrl(storeId, row.mobile_media_id ?? row.desktop_media_id),
    altText: row.alt_text,
    placement: row.placement,
    afterCategoryId: row.after_category_id,
    targetType: row.target_type,
    targetId: row.target_id,
    externalUrl: row.external_url,
    ctaLabel: row.cta_label,
    deviceScope: row.device_scope,
    sortOrder: row.sort_order,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    displayStatus: bannerDisplayStatus(
      {
        status: row.status,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        placement: row.placement,
        afterCategoryId: row.after_category_id,
      },
      now,
      categoryActive,
    ),
    href: bannerHref({ targetType: row.target_type, targetId: row.target_id, externalUrl: row.external_url, slug }),
  };
}

export async function listBanners(db: D1Database, storeId: string, slug: string) {
  const rows = await db
    .prepare(`SELECT * FROM storefront_banners WHERE store_id = ? AND archived_at IS NULL ORDER BY placement, sort_order, created_at`)
    .bind(storeId)
    .all<BannerRow>();
  const categories = await db
    .prepare(`SELECT id, active FROM categories WHERE store_id = ? AND archived_at IS NULL`)
    .bind(storeId)
    .all<{ id: string; active: number }>();
  const active = new Set((categories.results ?? []).filter((item) => item.active).map((item) => item.id));
  const now = Date.now();
  return json({
    banners: (rows.results ?? []).map((row) =>
      presentBanner(storeId, slug, row, row.after_category_id ? active.has(row.after_category_id) : true, now),
    ),
  });
}

async function assertTargets(db: D1Database, storeId: string, input: { targetType: string; targetId?: string | null; desktopMediaId?: string | null; mobileMediaId?: string | null; afterCategoryId?: string | null }) {
  if (!(await mediaBelongsToStore(db, storeId, input.desktopMediaId))) return "A imagem desktop não pertence a esta loja.";
  if (!(await mediaBelongsToStore(db, storeId, input.mobileMediaId))) return "A imagem mobile não pertence a esta loja.";
  if (input.afterCategoryId) {
    const category = await db.prepare(`SELECT id FROM categories WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(input.afterCategoryId, storeId).first();
    if (!category) return "A categoria escolhida não pertence a esta loja.";
  }
  if (input.targetType === "product" && input.targetId) {
    const product = await db.prepare(`SELECT id FROM products WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(input.targetId, storeId).first();
    if (!product) return "O produto escolhido não pertence a esta loja.";
  }
  if (input.targetType === "category" && input.targetId) {
    const category = await db.prepare(`SELECT id FROM categories WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(input.targetId, storeId).first();
    if (!category) return "A categoria de destino não pertence a esta loja.";
  }
  if (input.targetType === "coupon" && input.targetId) {
    const coupon = await db.prepare(`SELECT id FROM coupons WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(input.targetId, storeId).first();
    if (!coupon) return "O cupom escolhido não pertence a esta loja.";
  }
  return null;
}

export async function createBanner(db: D1Database, storeId: string, slug: string, body: Record<string, unknown>) {
  const parsed = bannerWriteSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_input", message: "Revise os dados do banner." }, 400);
  const invalid = validateBannerInput(parsed.data);
  if (invalid) return json({ error: "invalid_input", message: invalid.message, field: invalid.field }, 400);
  const targetError = await assertTargets(db, storeId, parsed.data);
  if (targetError) return json({ error: "invalid_input", message: targetError }, 400);
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO storefront_banners (
        id, store_id, internal_name, desktop_media_id, mobile_media_id, alt_text, placement, after_category_id,
        target_type, target_id, external_url, cta_label, device_scope, sort_order, status, starts_at, ends_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      storeId,
      parsed.data.internalName.trim(),
      parsed.data.desktopMediaId ?? null,
      parsed.data.mobileMediaId ?? null,
      parsed.data.altText ?? null,
      parsed.data.placement,
      parsed.data.placement === "after_category" ? parsed.data.afterCategoryId ?? null : null,
      parsed.data.targetType,
      parsed.data.targetId ?? null,
      parsed.data.externalUrl ?? null,
      parsed.data.ctaLabel ?? null,
      parsed.data.deviceScope ?? "both",
      parsed.data.sortOrder ?? 0,
      parsed.data.status,
      parsed.data.startsAt ?? null,
      parsed.data.endsAt ?? null,
      now,
      now,
    )
    .run();
  return json({ ok: true, id });
}

export async function updateBanner(db: D1Database, storeId: string, slug: string, id: string, body: Record<string, unknown>) {
  const parsed = bannerWriteSchema.partial().safeParse(body);
  if (!parsed.success) return json({ error: "invalid_input", message: "Revise os dados do banner." }, 400);
  const current = await db.prepare(`SELECT * FROM storefront_banners WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first<BannerRow>();
  if (!current) return json({ error: "not_found", message: "Banner não encontrado." }, 404);
  const next = {
    internalName: parsed.data.internalName ?? current.internal_name,
    placement: parsed.data.placement ?? current.placement,
    afterCategoryId: parsed.data.afterCategoryId === undefined ? current.after_category_id : parsed.data.afterCategoryId,
    targetType: parsed.data.targetType ?? current.target_type,
    targetId: parsed.data.targetId === undefined ? current.target_id : parsed.data.targetId,
    externalUrl: parsed.data.externalUrl === undefined ? current.external_url : parsed.data.externalUrl,
    status: parsed.data.status ?? current.status,
    startsAt: parsed.data.startsAt === undefined ? current.starts_at : parsed.data.startsAt,
    endsAt: parsed.data.endsAt === undefined ? current.ends_at : parsed.data.endsAt,
    desktopMediaId: parsed.data.desktopMediaId === undefined ? current.desktop_media_id : parsed.data.desktopMediaId,
    mobileMediaId: parsed.data.mobileMediaId === undefined ? current.mobile_media_id : parsed.data.mobileMediaId,
  };
  const invalid = validateBannerInput(next);
  if (invalid) return json({ error: "invalid_input", message: invalid.message, field: invalid.field }, 400);
  const targetError = await assertTargets(db, storeId, next);
  if (targetError) return json({ error: "invalid_input", message: targetError }, 400);
  await db
    .prepare(
      `UPDATE storefront_banners SET internal_name = ?, desktop_media_id = ?, mobile_media_id = ?, alt_text = ?, placement = ?,
       after_category_id = ?, target_type = ?, target_id = ?, external_url = ?, cta_label = ?, device_scope = ?, sort_order = ?,
       status = ?, starts_at = ?, ends_at = ?, updated_at = ? WHERE id = ? AND store_id = ?`,
    )
    .bind(
      next.internalName,
      next.desktopMediaId,
      next.mobileMediaId,
      parsed.data.altText === undefined ? current.alt_text : parsed.data.altText,
      next.placement,
      next.placement === "after_category" ? next.afterCategoryId : null,
      next.targetType,
      next.targetId,
      next.externalUrl,
      parsed.data.ctaLabel === undefined ? current.cta_label : parsed.data.ctaLabel,
      parsed.data.deviceScope ?? current.device_scope,
      parsed.data.sortOrder ?? current.sort_order,
      next.status,
      next.startsAt,
      next.endsAt,
      Date.now(),
      id,
      storeId,
    )
    .run();
  return json({ ok: true });
}

export async function duplicateBanner(db: D1Database, storeId: string, id: string) {
  const row = await db.prepare(`SELECT * FROM storefront_banners WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(id, storeId).first<BannerRow>();
  if (!row) return json({ error: "not_found" }, 404);
  const nextId = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO storefront_banners (
        id, store_id, internal_name, desktop_media_id, mobile_media_id, alt_text, placement, after_category_id,
        target_type, target_id, external_url, cta_label, device_scope, sort_order, status, starts_at, ends_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`,
    )
    .bind(
      nextId,
      storeId,
      `${row.internal_name} (cópia)`,
      row.desktop_media_id,
      row.mobile_media_id,
      row.alt_text,
      row.placement,
      row.after_category_id,
      row.target_type,
      row.target_id,
      row.external_url,
      row.cta_label,
      row.device_scope,
      row.sort_order,
      row.starts_at,
      row.ends_at,
      now,
      now,
    )
    .run();
  return json({ ok: true, id: nextId });
}

export async function reorderBanners(db: D1Database, storeId: string, ids: string[]) {
  let order = 0;
  for (const id of ids) {
    await db.prepare(`UPDATE storefront_banners SET sort_order = ?, updated_at = ? WHERE id = ? AND store_id = ? AND archived_at IS NULL`).bind(order, Date.now(), id, storeId).run();
    order += 1;
  }
  return json({ ok: true });
}

export async function bannerOptions(db: D1Database, storeId: string) {
  const categories = await db.prepare(`SELECT id, name, active FROM categories WHERE store_id = ? AND archived_at IS NULL ORDER BY sort_order`).bind(storeId).all();
  const products = await db.prepare(`SELECT id, name, active FROM products WHERE store_id = ? AND archived_at IS NULL ORDER BY name`).bind(storeId).all();
  const coupons = await db.prepare(`SELECT id, name, code, active FROM coupons WHERE store_id = ? AND archived_at IS NULL ORDER BY created_at DESC`).bind(storeId).all();
  return json({ categories: categories.results ?? [], products: products.results ?? [], coupons: coupons.results ?? [] });
}

export async function publicBanners(db: D1Database, storeId: string, slug: string) {
  const rows = await db
    .prepare(`SELECT * FROM storefront_banners WHERE store_id = ? AND archived_at IS NULL ORDER BY sort_order, created_at`)
    .bind(storeId)
    .all<BannerRow>();
  const categories = await db
    .prepare(`SELECT id, active FROM categories WHERE store_id = ? AND archived_at IS NULL`)
    .bind(storeId)
    .all<{ id: string; active: number }>();
  const active = new Set((categories.results ?? []).filter((item) => item.active).map((item) => item.id));
  const now = Date.now();
  return (rows.results ?? [])
    .filter((row) =>
      bannerIsPublic(
        {
          status: row.status,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          deviceScope: row.device_scope,
          desktopMediaId: row.desktop_media_id,
          mobileMediaId: row.mobile_media_id,
          placement: row.placement,
          afterCategoryId: row.after_category_id,
        },
        now,
        "desktop",
        row.after_category_id ? active.has(row.after_category_id) : true,
      ) ||
      bannerIsPublic(
        {
          status: row.status,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          deviceScope: row.device_scope,
          desktopMediaId: row.desktop_media_id,
          mobileMediaId: row.mobile_media_id,
          placement: row.placement,
          afterCategoryId: row.after_category_id,
        },
        now,
        "mobile",
        row.after_category_id ? active.has(row.after_category_id) : true,
      ),
    )
    .map((row) => ({
      id: row.id,
      placement: row.placement,
      afterCategoryId: row.after_category_id,
      desktopUrl: mediaUrl(storeId, row.desktop_media_id ?? row.mobile_media_id),
      mobileUrl: mediaUrl(storeId, row.mobile_media_id ?? row.desktop_media_id),
      alt: row.alt_text || "Banner promocional",
      href: bannerHref({ targetType: row.target_type, targetId: row.target_id, externalUrl: row.external_url, slug }),
      ctaLabel: row.cta_label,
      deviceScope: row.device_scope,
      sortOrder: row.sort_order,
    }));
}
