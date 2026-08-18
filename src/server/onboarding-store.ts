export type ExistingOnboardingStore = {
  id: string;
  organizationId: string;
  slug: string;
  status: string;
  archivedAt: number | null;
  createdVia: string;
};

export function isArchivedStore(store: { archivedAt?: number | null }): boolean {
  return Boolean(store.archivedAt);
}

export function findReusablePublicStore(stores: ExistingOnboardingStore[]): ExistingOnboardingStore | null {
  const live = stores.filter((store) => !isArchivedStore(store));
  return (
    live.find((store) => store.createdVia === "public_onboarding") ??
    live.find((store) => store.status === "ACTIVE" || store.status === "PENDING_REVIEW" || store.status === "DRAFT") ??
    live[0] ??
    null
  );
}

export function canCreatePublicOnboardingStore(stores: ExistingOnboardingStore[]): boolean {
  return findReusablePublicStore(stores) === null;
}

export function approvalAlreadyDone(status: string | null | undefined): boolean {
  return status === "ACTIVE" || status === "APPROVED";
}

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function shouldReplaceNumericSlug(slug: string, name: string): boolean {
  return /^\d+$/.test(slug) && slugifyName(name).length >= 3;
}

export function storeApprovalLabel(status: string | null | undefined): string {
  if (status === "DRAFT") return "Rascunho";
  if (status === "PENDING_REVIEW") return "Em análise";
  if (status === "ACTIVE" || status === "APPROVED") return "Ativa";
  if (status === "SUSPENDED") return "Suspensa";
  if (status === "REJECTED") return "Rejeitada";
  return "Não informado";
}

export function reaisToCents(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

export function centsToReais(value: number): number {
  return Math.round(value) / 100;
}
