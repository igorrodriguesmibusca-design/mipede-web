import { BottomNav } from "@/components/storefront/bottom-nav";
import { PublicStoreMenu } from "@/components/storefront/public-store-menu";

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="pb-24">
      <PublicStoreMenu slug={slug} />
      <BottomNav active="home" />
    </div>
  );
}
