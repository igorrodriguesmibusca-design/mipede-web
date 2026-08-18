-- Arquivamento reversível de lojas duplicadas e origem do cadastro.
ALTER TABLE stores ADD COLUMN archived_at INTEGER;
ALTER TABLE stores ADD COLUMN archive_reason TEXT;
ALTER TABLE stores ADD COLUMN created_via TEXT NOT NULL DEFAULT 'public_onboarding';
