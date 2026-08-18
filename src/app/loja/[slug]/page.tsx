import { PublicStoreMenu } from "@/components/storefront/public-store-menu";
import { StorefrontBottomNav } from "@/components/storefront/storefront-bottom-nav";

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="pb-24">
      <PublicStoreMenu slug={slug} />
      <StorefrontBottomNav slug={slug} active="home" />
    </div>
  );
}
