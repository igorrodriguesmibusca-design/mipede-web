import { BottomNav } from "@/components/storefront/bottom-nav";
import { CategoryTabs } from "@/components/storefront/category-tabs";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductRow } from "@/components/storefront/product-row";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { StoreHeader } from "@/components/storefront/store-header";
import { categories, products } from "@/data/mock-products";

export default function StoreHomePage() {
  const visibleCategories = categories.filter((category) => category.available);
  const listProducts = products.filter((product) => product.available);

  return (
    <div className="pb-24">
      <StoreHeader />
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-8">
        <PromoBanner />
        <div className="mt-5">
          <CategoryTabs items={visibleCategories} activeId="pizzas" />
        </div>

        <div className="mt-4 md:hidden">
          {listProducts.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4">
          {listProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
