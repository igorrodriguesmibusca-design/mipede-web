import { notFound } from "next/navigation";

import { OrderManagerLayout } from "@/components/order-manager/order-manager-layout";

export function generateStaticParams() {
  return [{ storeSlug: "pizzaria-imperial" }];
}

export default async function GestorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  if (storeSlug !== "pizzaria-imperial") {
    notFound();
  }

  return <OrderManagerLayout>{children}</OrderManagerLayout>;
}
