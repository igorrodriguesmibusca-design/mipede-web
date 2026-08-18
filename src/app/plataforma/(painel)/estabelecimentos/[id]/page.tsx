import { PlatformStoreDetail } from "@/components/platform/store-detail";

export default async function PlatformStoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlatformStoreDetail storeId={id} />;
}
