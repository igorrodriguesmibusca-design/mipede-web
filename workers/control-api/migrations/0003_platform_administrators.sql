-- Gestores globais da plataforma. PII em AES-GCM; e-mail pesquisável só por HMAC.

CREATE TABLE IF NOT EXISTS platform_administrators (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  encrypted_name TEXT NOT NULL,
  encrypted_email TEXT NOT NULL,
  normalized_email_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('platform_owner', 'platform_admin')),
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
  created_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  suspended_at INTEGER,
  last_access_at INTEGER,
  key_version TEXT NOT NULL DEFAULT 'v1',
  FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_admin_user ON platform_administrators(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_admin_email_hash ON platform_administrators(normalized_email_hash);
CREATE INDEX IF NOT EXISTS idx_platform_admin_status ON platform_administrators(status, role);

CREATE TABLE IF NOT EXISTS platform_admin_invitations (
  id TEXT PRIMARY KEY,
  normalized_email_hash TEXT NOT NULL,
  encrypted_email TEXT NOT NULL,
  encrypted_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('platform_admin')),
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_by TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  accepted_by TEXT,
  accepted_at INTEGER,
  created_at INTEGER NOT NULL,
  revoked_at INTEGER,
  key_version TEXT NOT NULL DEFAULT 'v1'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_invite_token ON platform_admin_invitations(token_hash);
CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_invite_pending_email
  ON platform_admin_invitations(normalized_email_hash)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_platform_invite_status ON platform_admin_invitations(status, expires_at);
