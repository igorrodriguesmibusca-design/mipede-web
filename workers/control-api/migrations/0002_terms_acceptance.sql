-- Aceite de termos após autenticação Google. Sem tokens, cookies ou PII completa.

CREATE TABLE IF NOT EXISTS terms_acceptances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_summary TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_terms_user ON terms_acceptances(user_id);
