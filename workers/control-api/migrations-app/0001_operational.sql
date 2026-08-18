-- mipede-app: dados operacionais multi-tenant. Isolamento lógico por store_id.

CREATE TABLE IF NOT EXISTS store_settings (
  store_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  whatsapp TEXT,
  phone TEXT,
  min_order_cents INTEGER NOT NULL DEFAULT 0,
  logo_key TEXT,
  cover_key TEXT,
  is_open INTEGER NOT NULL DEFAULT 1,
  hours_label TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Bahia',
  address_line TEXT,
  city TEXT,
  state TEXT,
  delivery_own INTEGER NOT NULL DEFAULT 1,
  pickup INTEGER NOT NULL DEFAULT 1,
  dine_in INTEGER NOT NULL DEFAULT 0,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  eta_minutes INTEGER,
  free_delivery_cents INTEGER,
  delivery_area TEXT,
  pay_cash INTEGER NOT NULL DEFAULT 1,
  pay_pix INTEGER NOT NULL DEFAULT 1,
  pay_debit INTEGER NOT NULL DEFAULT 0,
  pay_credit INTEGER NOT NULL DEFAULT 0,
  change_needed INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_categories_store ON categories(store_id, archived_at, sort_order);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  promo_price_cents INTEGER,
  image_key TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id, archived_at, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(store_id, category_id);

CREATE TABLE IF NOT EXISTS complement_groups (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  min_select INTEGER NOT NULL DEFAULT 0,
  max_select INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_groups_store ON complement_groups(store_id, archived_at, sort_order);

CREATE TABLE IF NOT EXISTS complement_options (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER,
  FOREIGN KEY (group_id) REFERENCES complement_groups(id)
);

CREATE INDEX IF NOT EXISTS idx_options_group ON complement_options(store_id, group_id, archived_at);

CREATE TABLE IF NOT EXISTS product_complement_groups (
  store_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (store_id, product_id, group_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  min_order_cents INTEGER NOT NULL DEFAULT 0,
  max_discount_cents INTEGER,
  starts_at INTEGER,
  ends_at INTEGER,
  usage_limit INTEGER,
  per_customer_limit INTEGER,
  new_customers_only INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_store_code ON coupons(store_id, code) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_store ON coupons(store_id, archived_at);

CREATE TABLE IF NOT EXISTS tracking_links (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  destination TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  clicks INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  carts INTEGER NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  revenue_cents INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tracking_store ON tracking_links(store_id, archived_at);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT,
  phone_masked TEXT,
  created_at INTEGER NOT NULL,
  last_order_at INTEGER,
  orders_count INTEGER NOT NULL DEFAULT 0,
  spent_cents INTEGER NOT NULL DEFAULT 0,
  archived_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id, archived_at);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  customer_id TEXT,
  status TEXT NOT NULL,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status, created_at);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  store_id TEXT NOT NULL,
  key TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status INTEGER NOT NULL,
  response_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (store_id, key)
);

CREATE TABLE IF NOT EXISTS media_objects (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  mime TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_store ON media_objects(store_id);
