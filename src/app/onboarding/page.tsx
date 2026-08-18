import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function OnboardingIndexPage() {
  redirect(routes.onboarding.company);
}
