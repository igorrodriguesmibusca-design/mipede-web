import { PublicProductPage } from "@/components/storefront/public-product-page";
import { StorefrontBottomNav } from "@/components/storefront/storefront-bottom-nav";

export default async function PublicProductRoute({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  return (
    <div className="pb-16">
      <PublicProductPage slug={slug} productId={productId} />
      <StorefrontBottomNav slug={slug} active="home" />
    </div>
  );
}
