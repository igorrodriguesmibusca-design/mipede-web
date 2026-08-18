import { describe, expect, it } from "vitest";

import {
  adminStatusLabel,
  auditEventLabel,
  firstName,
  inviteStatusLabel,
  isKnownAuditEvent,
  isSensitiveAuditKey,
  locationLabel,
  onboardingStatusLabel,
  platformRoleLabel,
  provisioningNeedsAttention,
  provisioningStatusLabel,
  resourceTypeLabel,
  safeAuditDetails,
  storeActionLabel,
  storeActionsForStatus,
  storeDecisionActions,
  storeStatusLabel,
} from "./platform-labels";

describe("platform labels", () => {
  it("traduz papéis sem expor nomes internos", () => {
    expect(platformRoleLabel("platform_owner")).toBe("Proprietário da plataforma");
    expect(platformRoleLabel("platform_admin")).toBe("Administrador da plataforma");
    expect(platformRoleLabel("platform_owner")).not.toContain("platform_");
  });

  it("traduz status de loja, onboarding e provisionamento", () => {
    expect(storeStatusLabel("PENDING_REVIEW")).toBe("Aguardando aprovação");
    expect(storeStatusLabel("ACTIVE")).toBe("Ativo");
    expect(storeStatusLabel("SUSPENDED")).toBe("Suspenso");
    expect(storeStatusLabel("REJECTED")).toBe("Rejeitado");
    expect(storeStatusLabel("INACTIVE")).toBe("Inativo");
    expect(onboardingStatusLabel("NOT_STARTED")).toBe("Não iniciado");
    expect(onboardingStatusLabel("company")).toBe("Não iniciado");
    expect(onboardingStatusLabel("operation")).toBe("Em andamento");
    expect(onboardingStatusLabel("submitted")).toBe("Enviado para análise");
    expect(onboardingStatusLabel("COMPLETED")).toBe("Concluído");
    expect(provisioningStatusLabel("NOT_STARTED")).toBe("Não iniciado");
    expect(provisioningStatusLabel("PENDING")).toBe("Pendente");
    expect(provisioningStatusLabel("IN_PROGRESS")).toBe("Em preparação");
    expect(provisioningStatusLabel("READY")).toBe("Pronto");
    expect(provisioningStatusLabel("FAILED")).toBe("Precisa de atenção");
  });

  it("não devolve enums crus quando o valor é conhecido", () => {
    expect(storeStatusLabel("PENDING_REVIEW")).not.toBe("PENDING_REVIEW");
    expect(onboardingStatusLabel("submitted")).not.toBe("submitted");
    expect(provisioningStatusLabel("IN_PROGRESS")).not.toBe("IN_PROGRESS");
    expect(adminStatusLabel("active")).toBe("Ativo");
    expect(inviteStatusLabel("pending")).toBe("Pendente");
  });

  it("usa Não informado para valores ausentes", () => {
    expect(storeStatusLabel(null)).toBe("Não informado");
    expect(locationLabel(null, null)).toBe("Não informado");
    expect(platformRoleLabel("")).toBe("Não informado");
  });

  it("mostra só as ações compatíveis com o status da loja", () => {
    expect(storeActionsForStatus("PENDING_REVIEW")).toEqual(["view", "approve", "reject"]);
    expect(storeActionsForStatus("ACTIVE")).toEqual(["view", "suspend"]);
    expect(storeActionsForStatus("SUSPENDED")).toEqual(["view", "reactivate"]);
    expect(storeActionsForStatus("REJECTED")).toEqual(["view"]);
    expect(storeDecisionActions("PENDING_REVIEW")).not.toContain("suspend");
    expect(storeDecisionActions("ACTIVE")).not.toContain("approve");
    expect(storeActionLabel("view")).toBe("Ver detalhes");
  });

  it("traduz eventos de auditoria sem devolver o nome técnico", () => {
    expect(auditEventLabel("store_approved")).toBe("Estabelecimento aprovado");
    expect(auditEventLabel("store_rejected")).toBe("Estabelecimento rejeitado");
    expect(auditEventLabel("store_suspended")).toBe("Estabelecimento suspenso");
    expect(auditEventLabel("store_reactivated")).toBe("Estabelecimento reativado");
    expect(auditEventLabel("platform_owner_bootstrapped")).toBe("Proprietário da plataforma configurado");
    expect(auditEventLabel("platform_admin_invited")).toBe("Administrador convidado");
    expect(auditEventLabel("platform_admin_invite_revoked")).toBe("Convite de administrador revogado");
    expect(auditEventLabel("platform_admin_suspended")).toBe("Administrador suspenso");
    expect(auditEventLabel("platform_admin_reactivated")).toBe("Administrador reativado");
    expect(auditEventLabel("onboarding_submit")).toBe("Cadastro enviado para análise");
    expect(auditEventLabel("terms_accepted")).toBe("Termos de uso aceitos");
    expect(auditEventLabel("register")).toBe("Conta criada");
    expect(auditEventLabel("store_approved")).not.toBe("store_approved");
    expect(auditEventLabel("algo_desconhecido")).toBe("Ação registrada");
    expect(isKnownAuditEvent("terms_accepted")).toBe(true);
    expect(resourceTypeLabel("store")).toBe("Estabelecimento");
  });

  it("esconde detalhes sensíveis da auditoria", () => {
    expect(isSensitiveAuditKey("token")).toBe(true);
    expect(isSensitiveAuditKey("ip_hash")).toBe(true);
    expect(isSensitiveAuditKey("encrypted_email")).toBe(true);
    const rows = safeAuditDetails({
      resource_type: "store",
      token: "abc",
      ip: "1.1.1.1",
      nested: { secret: true },
    });
    expect(rows.some((row) => row.value === "abc")).toBe(false);
    expect(rows.some((row) => row.value === "1.1.1.1")).toBe(false);
    expect(rows.find((row) => row.label === "Recurso")?.value).toBe("Estabelecimento");
  });

  it("identifica provisionamento que precisa de atenção", () => {
    expect(provisioningNeedsAttention("PENDING")).toBe(true);
    expect(provisioningNeedsAttention("FAILED")).toBe(true);
    expect(provisioningNeedsAttention("READY")).toBe(false);
  });

  it("extrai o primeiro nome da saudação", () => {
    expect(firstName("Igor Rodrigues")).toBe("Igor");
    expect(firstName("")).toBe("");
  });
});
