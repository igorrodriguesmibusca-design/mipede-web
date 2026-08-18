import { PublicCartPage } from "@/components/storefront/public-cart-page";
import { StorefrontBottomNav } from "@/components/storefront/storefront-bottom-nav";

export default async function PublicCartRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div>
      <PublicCartPage slug={slug} />
      <StorefrontBottomNav slug={slug} active="cart" />
    </div>
  );
}
