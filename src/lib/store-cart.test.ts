import { describe, expect, it } from "vitest";

import { cartItemTotalCents, cartTotalCents, emptyCart, parseCart } from "./store-cart";

describe("carrinho por loja", () => {
  it("soma item com complementos e quantidade em centavos", () => {
    const total = cartItemTotalCents({
      lineId: "1",
      productId: "p1",
      name: "Hot dog",
      imageUrl: null,
      basePriceCents: 1500,
      complements: [
        { groupId: "g1", optionId: "o1", name: "Ketchup", priceCents: 0 },
        { groupId: "g1", optionId: "o2", name: "Barbecue", priceCents: 200 },
      ],
      quantity: 2,
      note: "",
    });
    expect(total).toBe(3400);
  });

  it("não mistura carrinho de outra loja", () => {
    const other = JSON.stringify({
      version: 1,
      slug: "outra-loja",
      items: [{ lineId: "x", productId: "p", name: "X", imageUrl: null, basePriceCents: 100, complements: [], quantity: 1, note: "", totalCents: 100 }],
    });
    expect(parseCart(other, "hot-dog-da-casa").items).toHaveLength(0);
    expect(parseCart(other, "outra-loja").items).toHaveLength(1);
  });

  it("carrinho vazio começa sem itens", () => {
    expect(emptyCart("hot-dog-da-casa").items).toEqual([]);
    expect(cartTotalCents(emptyCart("loja"))).toBe(0);
  });
});
