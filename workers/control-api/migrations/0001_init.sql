-- mipede-control: autenticação Better Auth + lojas + auditoria
-- SQLite / Cloudflare D1. Sempre usar prepared statements.

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  whatsapp TEXT
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL,
  activeOrganizationId TEXT,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);

CREATE TABLE IF NOT EXISTS organization (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  createdAt INTEGER NOT NULL,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS member (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organization(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invitation (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  status TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  inviterId TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organization(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  onboarding_status TEXT NOT NULL,
  provisioning_status TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  business_type TEXT,
  whatsapp TEXT,
  city TEXT,
  state TEXT,
  cnpj TEXT,
  delivery_own INTEGER NOT NULL DEFAULT 1,
  pickup INTEGER NOT NULL DEFAULT 1,
  dine_in INTEGER NOT NULL DEFAULT 0,
  hours_label TEXT,
  prep_minutes INTEGER,
  min_order INTEGER,
  payments TEXT,
  delivery_area TEXT,
  description TEXT,
  primary_color TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  approved_at INTEGER,
  approved_by TEXT,
  rejection_reason TEXT,
  FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  organization_id TEXT,
  store_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata_safe TEXT,
  ip_hash TEXT,
  user_agent_summary TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_member_user ON member(userId);
CREATE INDEX IF NOT EXISTS idx_member_org ON member(organizationId);
CREATE INDEX IF NOT EXISTS idx_stores_org ON stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
