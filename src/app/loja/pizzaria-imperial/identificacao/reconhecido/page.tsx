"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/storefront/page-header";
import { ReturningCustomerCard } from "@/components/storefront/returning-customer-card";
import { demoCustomerJuliana } from "@/data/mock-customer-profile";
import { clearDemoSessionToken } from "@/lib/demo-customer-session";
import { routes } from "@/lib/routes";

export default function RecognizedCustomerPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Identifique-se" href={routes.store.cart} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-5">
        <ReturningCustomerCard
          profile={demoCustomerJuliana}
          onContinue={() => router.push(routes.store.checkoutAddress)}
          onChangeData={() => router.push(`${routes.store.identify}?novo=1`)}
          onChangeAddress={() => router.push(routes.store.address)}
          onAddAddress={() => router.push(routes.store.address)}
          onNotMe={() => {
            clearDemoSessionToken();
            router.push(`${routes.store.identify}?novo=1`);
          }}
        />
      </div>
    </div>
  );
}
