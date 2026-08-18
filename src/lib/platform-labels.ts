export type BadgeTone = "success" | "warning" | "danger" | "muted" | "default" | "info";

export type StoreDecisionAction = "approve" | "reject" | "suspend" | "reactivate";
export type StoreUiAction = "view" | StoreDecisionAction;

const MISSING = "Não informado";

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function key(value: string | null | undefined): string {
  return normalize(value).toLowerCase().replace(/[\s-]+/g, "_");
}

export function displayValue(value: unknown, fallback = MISSING): string {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

export function firstName(fullName: string | null | undefined): string {
  const name = normalize(fullName);
  if (!name) return "";
  return name.split(/\s+/)[0] ?? name;
}

export function formatPlatformDate(value: number | string | null | undefined): string {
  if (value == null || value === "") return MISSING;
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return MISSING;
  return date.toLocaleDateString("pt-BR");
}

export function formatPlatformDateTime(value: number | string | null | undefined): string {
  if (value == null || value === "") return MISSING;
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return MISSING;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function platformRoleLabel(role: string | null | undefined): string {
  const value = key(role);
  if (value === "platform_owner") return "Proprietário da plataforma";
  if (value === "platform_admin") return "Administrador da plataforma";
  return MISSING;
}

export function adminStatusLabel(status: string | null | undefined): string {
  const value = key(status);
  if (value === "active") return "Ativo";
  if (value === "suspended") return "Suspenso";
  return MISSING;
}

export function inviteStatusLabel(status: string | null | undefined): string {
  const value = key(status);
  if (value === "pending") return "Pendente";
  if (value === "accepted") return "Aceito";
  if (value === "revoked") return "Revogado";
  if (value === "expired") return "Expirado";
  return MISSING;
}

const STORE_STATUS_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  pending_review: { label: "Aguardando aprovação", tone: "warning" },
  active: { label: "Ativo", tone: "success" },
  approved: { label: "Aprovado", tone: "success" },
  suspended: { label: "Suspenso", tone: "danger" },
  rejected: { label: "Rejeitado", tone: "danger" },
  inactive: { label: "Inativo", tone: "muted" },
  draft: { label: "Rascunho", tone: "muted" },
};

export function storeStatusMeta(status: string | null | undefined) {
  return STORE_STATUS_MAP[key(status)] ?? { label: MISSING, tone: "muted" as const };
}

export function storeStatusLabel(status: string | null | undefined): string {
  return storeStatusMeta(status).label;
}

const ONBOARDING_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  not_started: { label: "Não iniciado", tone: "muted" },
  company: { label: "Não iniciado", tone: "muted" },
  in_progress: { label: "Em andamento", tone: "warning" },
  operation: { label: "Em andamento", tone: "warning" },
  identity: { label: "Em andamento", tone: "warning" },
  submitted: { label: "Enviado para análise", tone: "warning" },
  completed: { label: "Concluído", tone: "success" },
};

export function onboardingStatusMeta(status: string | null | undefined) {
  return ONBOARDING_MAP[key(status)] ?? { label: MISSING, tone: "muted" as const };
}

export function onboardingStatusLabel(status: string | null | undefined): string {
  return onboardingStatusMeta(status).label;
}

const PROVISIONING_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  not_started: { label: "Não iniciado", tone: "muted" },
  pending: { label: "Pendente", tone: "warning" },
  in_progress: { label: "Em preparação", tone: "warning" },
  ready: { label: "Pronto", tone: "success" },
  failed: { label: "Precisa de atenção", tone: "danger" },
};

export function provisioningStatusMeta(status: string | null | undefined) {
  return PROVISIONING_MAP[key(status)] ?? { label: MISSING, tone: "muted" as const };
}

export function provisioningStatusLabel(status: string | null | undefined): string {
  return provisioningStatusMeta(status).label;
}

export function adminStatusTone(status: string | null | undefined): BadgeTone {
  return key(status) === "active" ? "success" : key(status) === "suspended" ? "danger" : "muted";
}

export function inviteStatusTone(status: string | null | undefined): BadgeTone {
  const value = key(status);
  if (value === "pending") return "warning";
  if (value === "accepted") return "success";
  if (value === "revoked" || value === "expired") return "danger";
  return "muted";
}

export function platformRoleTone(role: string | null | undefined): BadgeTone {
  return key(role) === "platform_owner" ? "default" : "info";
}

const AUDIT_EVENT_MAP: Record<string, string> = {
  store_approved: "Estabelecimento aprovado",
  store_rejected: "Estabelecimento rejeitado",
  store_suspended: "Estabelecimento suspenso",
  store_reactivated: "Estabelecimento reativado",
  platform_owner_bootstrapped: "Proprietário da plataforma configurado",
  platform_admin_recognized: "Administrador da plataforma reconhecido",
  platform_admin_invited: "Administrador convidado",
  platform_admin_invite_revoked: "Convite de administrador revogado",
  platform_admin_suspended: "Administrador suspenso",
  platform_admin_reactivated: "Administrador reativado",
  platform_admin_added: "Administrador adicionado",
  platform_admin_removed: "Administrador removido",
  onboarding_submit: "Cadastro enviado para análise",
  onboarding_company: "Cadastro do estabelecimento iniciado",
  terms_accepted: "Termos de uso aceitos",
  register: "Conta criada",
};

export function auditEventLabel(action: string | null | undefined): string {
  const value = key(action);
  if (!value) return MISSING;
  return AUDIT_EVENT_MAP[value] ?? "Ação registrada";
}

export function isKnownAuditEvent(action: string | null | undefined): boolean {
  return key(action) in AUDIT_EVENT_MAP;
}

const RESOURCE_TYPE_MAP: Record<string, string> = {
  store: "Estabelecimento",
  platform_admin: "Administrador",
  platform_invite: "Convite de administrador",
  user: "Conta",
};

export function resourceTypeLabel(type: string | null | undefined): string {
  const value = key(type);
  if (!value) return MISSING;
  return RESOURCE_TYPE_MAP[value] ?? "Recurso da plataforma";
}

export const AUDIT_EVENT_OPTIONS = Object.entries(AUDIT_EVENT_MAP).map(([value, label]) => ({
  value,
  label,
}));

export function storeActionsForStatus(status: string | null | undefined): StoreUiAction[] {
  switch (key(status)) {
    case "pending_review":
      return ["view", "approve", "reject"];
    case "active":
    case "approved":
      return ["view", "suspend"];
    case "suspended":
      return ["view", "reactivate"];
    default:
      return ["view"];
  }
}

export function storeDecisionActions(status: string | null | undefined): StoreDecisionAction[] {
  return storeActionsForStatus(status).filter((action): action is StoreDecisionAction => action !== "view");
}

export function storePrimaryDecision(status: string | null | undefined): StoreDecisionAction | null {
  const actions = storeDecisionActions(status);
  return actions[0] ?? null;
}

export function storeActionLabel(action: StoreUiAction): string {
  if (action === "view") return "Ver detalhes";
  if (action === "approve") return "Aprovar";
  if (action === "reject") return "Rejeitar";
  if (action === "suspend") return "Suspender";
  return "Reativar";
}

export function storeDecisionCopy(action: StoreDecisionAction): {
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
  requiresReason: boolean;
} {
  if (action === "approve") {
    return {
      title: "Deseja aprovar este estabelecimento?",
      description: "Após a aprovação, a loja poderá avançar para a ativação do cardápio público.",
      confirmLabel: "Aprovar estabelecimento",
      destructive: false,
      requiresReason: false,
    };
  }
  if (action === "reject") {
    return {
      title: "Deseja rejeitar este estabelecimento?",
      description: "Informe o motivo da recusa. O responsável poderá revisar o cadastro depois.",
      confirmLabel: "Rejeitar cadastro",
      destructive: true,
      requiresReason: true,
    };
  }
  if (action === "suspend") {
    return {
      title: "Deseja suspender este estabelecimento?",
      description: "A loja deixa de operar na plataforma até ser reativada. Informe o motivo da suspensão.",
      confirmLabel: "Suspender estabelecimento",
      destructive: true,
      requiresReason: true,
    };
  }
  return {
    title: "Deseja reativar este estabelecimento?",
    description: "A loja volta a ficar ativa e poderá operar normalmente na plataforma.",
    confirmLabel: "Reativar estabelecimento",
    destructive: false,
    requiresReason: false,
  };
}

const SENSITIVE_DETAIL_KEYS = [
  "token",
  "cookie",
  "secret",
  "password",
  "hash",
  "ip",
  "header",
  "headers",
  "stack",
  "encrypted",
  "authorization",
  "set-cookie",
  "user_agent",
  "ua",
];

export function isSensitiveAuditKey(name: string): boolean {
  const value = key(name);
  return SENSITIVE_DETAIL_KEYS.some((item) => value === item || value.includes(item));
}

export function safeAuditDetails(input: Record<string, unknown> | null | undefined): Array<{ label: string; value: string }> {
  if (!input) return [];
  const rows: Array<{ label: string; value: string }> = [];
  for (const [name, raw] of Object.entries(input)) {
    if (isSensitiveAuditKey(name)) continue;
    if (raw == null || raw === "") continue;
    if (typeof raw === "object") continue;
    const text = String(raw);
    if (!text || text.length > 180) continue;
    rows.push({
      label: name === "resource_type" ? "Recurso" : name === "resource_id" ? "Identificador interno" : name,
      value: name === "resource_type" ? resourceTypeLabel(text) : text,
    });
  }
  return rows;
}

export function inviteIsExpiringSoon(expiresAt: number | null | undefined, now = Date.now()): boolean {
  if (!expiresAt) return false;
  const remaining = expiresAt - now;
  return remaining > 0 && remaining <= 12 * 60 * 60 * 1000;
}

export function provisioningNeedsAttention(status: string | null | undefined): boolean {
  const value = key(status);
  return value === "pending" || value === "in_progress" || value === "failed";
}

export function locationLabel(city?: string | null, state?: string | null): string {
  const cityText = normalize(city);
  const stateText = normalize(state);
  if (cityText && stateText) return `${cityText}, ${stateText}`;
  if (cityText) return cityText;
  if (stateText) return stateText;
  return MISSING;
}
