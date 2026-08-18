import { notFound } from "next/navigation";

import { OrderDetails } from "@/components/storefront/order-details";
import { getOrder } from "@/data/mock-orders";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderFullPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = getOrder(id);

  if (!order) {
    notFound();
  }

  return <OrderDetails order={order} extended />;
}
