import { BottomNav } from "@/components/storefront/bottom-nav";
import { CartView } from "@/components/storefront/cart-view";

export default function CartPage() {
  return (
    <>
      <CartView />
      <div className="md:hidden">
        <BottomNav active="cart" />
      </div>
    </>
  );
}
