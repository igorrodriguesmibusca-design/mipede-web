import Link from "next/link";

import { MipedeMark } from "@/components/brand/mipede-mark";
import { routes } from "@/lib/routes";

export default function OnboardingPage() {
  return (
    <Link
      href={routes.store.home}
      className="flex min-h-dvh flex-col items-center justify-center bg-brand"
    >
      <span className="sr-only">Entrar no cardápio da Pizzaria Imperial</span>
      <MipedeMark className="size-28" />
    </Link>
  );
}
