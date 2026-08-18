import { Badge } from "@/components/ui/badge";
import {
  adminStatusLabel,
  adminStatusTone,
  inviteStatusLabel,
  inviteStatusTone,
  onboardingStatusLabel,
  onboardingStatusMeta,
  provisioningStatusLabel,
  provisioningStatusMeta,
  storeStatusLabel,
  storeStatusMeta,
  type BadgeTone,
} from "@/lib/platform-labels";

const variantByTone: Record<BadgeTone, "success" | "warning" | "danger" | "muted" | "default" | "info"> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  muted: "muted",
  default: "default",
  info: "info",
};

export function PlatformStatusBadge({
  kind,
  value,
}: {
  kind: "store" | "onboarding" | "provisioning" | "admin" | "invite";
  value: string | null | undefined;
}) {
  const meta =
    kind === "store"
      ? storeStatusMeta(value)
      : kind === "onboarding"
        ? onboardingStatusMeta(value)
        : kind === "provisioning"
          ? provisioningStatusMeta(value)
          : kind === "admin"
            ? { label: adminStatusLabel(value), tone: adminStatusTone(value) }
            : { label: inviteStatusLabel(value), tone: inviteStatusTone(value) };

  return <Badge variant={variantByTone[meta.tone]}>{meta.label}</Badge>;
}

export function platformStatusText(kind: "store" | "onboarding" | "provisioning", value: string | null | undefined) {
  if (kind === "store") return storeStatusLabel(value);
  if (kind === "onboarding") return onboardingStatusLabel(value);
  return provisioningStatusLabel(value);
}
