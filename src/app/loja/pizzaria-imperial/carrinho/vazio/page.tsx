import { BottomNav } from "@/components/storefront/bottom-nav";
import { CartView } from "@/components/storefront/cart-view";

export default function EmptyCartPage() {
  return (
    <>
      <CartView empty />
      <BottomNav active="cart" />
    </>
  );
}
