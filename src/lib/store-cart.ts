import { lineTotalCents, unitPriceCents } from "./complement-rules";

export const CART_VERSION = 1;
export const CART_STORAGE_PREFIX = "mipede.cart.v1.";

export type CartComplement = {
  groupId: string;
  optionId: string;
  name: string;
  priceCents: number;
};

export type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  basePriceCents: number;
  complements: CartComplement[];
  quantity: number;
  note: string;
  totalCents: number;
};

export type StoreCart = {
  version: number;
  slug: string;
  items: CartItem[];
};

export function cartStorageKey(slug: string): string {
  return `${CART_STORAGE_PREFIX}${slug}`;
}

export function emptyCart(slug: string): StoreCart {
  return { version: CART_VERSION, slug, items: [] };
}

export function cartItemTotalCents(item: Omit<CartItem, "totalCents">): number {
  return lineTotalCents(
    unitPriceCents(
      item.basePriceCents,
      item.complements.map((complement) => complement.priceCents),
    ),
    item.quantity,
  );
}

export function cartTotalCents(cart: StoreCart): number {
  return cart.items.reduce((sum, item) => sum + item.totalCents, 0);
}

export function parseCart(raw: string | null, slug: string): StoreCart {
  if (!raw) return emptyCart(slug);
  try {
    const parsed = JSON.parse(raw) as StoreCart;
    if (parsed.version !== CART_VERSION || parsed.slug !== slug || !Array.isArray(parsed.items)) {
      return emptyCart(slug);
    }
    return parsed;
  } catch {
    return emptyCart(slug);
  }
}

export function readCart(slug: string): StoreCart {
  if (typeof window === "undefined") return emptyCart(slug);
  return parseCart(window.localStorage.getItem(cartStorageKey(slug)), slug);
}

export function writeCart(cart: StoreCart): StoreCart {
  if (typeof window === "undefined") return cart;
  window.localStorage.setItem(cartStorageKey(cart.slug), JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("mipede-cart-changed", { detail: { slug: cart.slug } }));
  return cart;
}

export function otherStoreCartSlug(exceptSlug: string): string | null {
  if (typeof window === "undefined") return null;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(CART_STORAGE_PREFIX) || key === cartStorageKey(exceptSlug)) continue;
    const cart = parseCart(window.localStorage.getItem(key), key.slice(CART_STORAGE_PREFIX.length));
    if (cart.items.length > 0) return cart.slug;
  }
  return null;
}

export function clearCart(slug: string): StoreCart {
  return writeCart(emptyCart(slug));
}

export function addCartItem(slug: string, item: Omit<CartItem, "lineId" | "totalCents">): StoreCart {
  const cart = readCart(slug);
  const nextItem: CartItem = {
    ...item,
    lineId: crypto.randomUUID(),
    totalCents: cartItemTotalCents({ ...item, lineId: "draft" }),
  };
  cart.items.push(nextItem);
  return writeCart(cart);
}

export function updateCartQuantity(slug: string, lineId: string, quantity: number): StoreCart {
  const cart = readCart(slug);
  cart.items = cart.items
    .map((item) => {
      if (item.lineId !== lineId) return item;
      const next = { ...item, quantity: Math.max(1, quantity) };
      return { ...next, totalCents: cartItemTotalCents(next) };
    })
    .filter((item) => item.quantity > 0);
  return writeCart(cart);
}

export function cartCount(cart: StoreCart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
