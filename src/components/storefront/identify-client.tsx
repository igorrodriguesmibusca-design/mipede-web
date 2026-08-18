"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CustomerIdentificationForm } from "@/components/storefront/customer-identification-form";
import { ReturningCustomerCard } from "@/components/storefront/returning-customer-card";
import { profileFromDemoToken } from "@/data/mock-customer-profile";
import { clearDemoSessionToken, useDemoSessionToken } from "@/lib/demo-customer-session";
import { routes } from "@/lib/routes";

export function IdentifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("novo") === "1";
  const token = useDemoSessionToken();
  const [edit, setEdit] = useState(forceNew);
  const profile = profileFromDemoToken(token);

  if (profile && !edit) {
    return (
      <ReturningCustomerCard
        profile={profile}
        onContinue={() => router.push(routes.store.checkout)}
        onChangeData={() => setEdit(true)}
        onChangeAddress={() => router.push(routes.store.address)}
        onAddAddress={() => router.push(routes.store.address)}
        onNotMe={() => {
          clearDemoSessionToken();
          setEdit(true);
        }}
      />
    );
  }

  return (
    <CustomerIdentificationForm
      initialName={profile?.name ?? ""}
      initialWhatsapp={profile?.whatsapp ?? ""}
    />
  );
}
