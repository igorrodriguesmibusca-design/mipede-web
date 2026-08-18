import Link from "next/link";

import { MipedeLogo } from "@/components/brand/mipede-mark";
import { routes } from "@/lib/routes";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
        <Link href={routes.auth.login} className="mb-8 inline-flex">
          <MipedeLogo />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-subtle">{description}</p>
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">{children}</div>
        {footer ? <div className="mt-5 text-sm text-subtle">{footer}</div> : null}
      </div>
    </div>
  );
}
