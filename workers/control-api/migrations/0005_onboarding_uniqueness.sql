-- Um cadastro público por proprietário. Novas lojas só por fluxo explícito futuro.
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_one_public_onboarding
  ON stores(owner_user_id)
  WHERE archived_at IS NULL AND created_via = 'public_onboarding';

CREATE UNIQUE INDEX IF NOT EXISTS idx_member_user_org
  ON member(userId, organizationId);
