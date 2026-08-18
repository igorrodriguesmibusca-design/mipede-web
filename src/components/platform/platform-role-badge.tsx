import { Badge } from "@/components/ui/badge";
import { platformRoleLabel, platformRoleTone } from "@/lib/platform-labels";
import { cn } from "@/lib/utils";

export function PlatformRoleBadge({ role, className }: { role: string | null | undefined; className?: string }) {
  const tone = platformRoleTone(role);
  return (
    <Badge variant={tone === "default" ? "default" : "info"} className={cn(className)}>
      {platformRoleLabel(role)}
    </Badge>
  );
}
