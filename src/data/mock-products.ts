export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  previousPrice?: number;
  discount?: number;
  image: string;
  available: boolean;
  status: "Ativo" | "Esgotado" | "Pausado";
};

export type Category = {
  id: string;
  name: string;
  productCount: number;
  available: boolean;
  status: "Ativa" | "Pausada";
  order: number;
};

export type AddonOption = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export type AddonGroup = {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  productCount: number;
  options: AddonOption[];
};

export const categories: Category[] = [
  { id: "pizzas", name: "Pizzas", productCount: 12, available: true, status: "Ativa", order: 1 },
  { id: "bebidas", name: "Bebidas", productCount: 18, available: true, status: "Ativa", order: 2 },
  { id: "porcoes", name: "Porções", productCount: 8, available: true, status: "Ativa", order: 3 },
  { id: "sobremesas", name: "Sobremesas", productCount: 6, available: false, status: "Pausada", order: 4 },
  { id: "combos", name: "Combos", productCount: 5, available: true, status: "Ativa", order: 5 },
];

export const products: Product[] = [
  {
    id: "pizza-calabresa",
    name: "Pizza Calabresa Grande",
    description: "Molho de tomate, mussarela, calabresa fatiada, cebola e orégano.",
    categoryId: "pizzas",
    categoryName: "Pizzas Salgadas",
    price: 38.9,
    image: "/mock/pizza-calabresa.jpg",
    available: true,
    status: "Ativo",
  },
  {
    id: "pizza-margherita",
    name: "Pizza Margherita",
    description: "Molho de tomate, mussarela, manjericão fresco e azeite.",
    categoryId: "pizzas",
    categoryName: "Pizzas Salgadas",
    price: 36.9,
    image: "/mock/pizza-margherita.jpg",
    available: true,
    status: "Ativo",
  },
  {
    id: "combo-familia",
    name: "Combo Família",
    description: "Pizza grande + refrigerante 2L + porção de batata frita.",
    categoryId: "combos",
    categoryName: "Combos",
    price: 74.9,
    previousPrice: 89.9,
    discount: 17,
    image: "/mock/combo-familia.jpg",
    available: true,
    status: "Ativo",
  },
  {
    id: "refrigerante-2l",
    name: "Refrigerante Cola 2L",
    description: "Garrafa de 2 litros, gelada.",
    categoryId: "bebidas",
    categoryName: "Bebidas",
    price: 12.9,
    image: "/mock/refrigerante.jpg",
    available: false,
    status: "Esgotado",
  },
  {
    id: "batata-frita",
    name: "Batata Frita Grande",
    description: "Porção generosa de batata frita crocante.",
    categoryId: "porcoes",
    categoryName: "Porções",
    price: 19.9,
    image: "/mock/batata-frita.jpg",
    available: true,
    status: "Ativo",
  },
  {
    id: "pizza-portuguesa",
    name: "Pizza Portuguesa",
    description: "Presunto, ovos, cebola, azeitona, ervilha e mussarela.",
    categoryId: "pizzas",
    categoryName: "Pizzas Salgadas",
    price: 42.9,
    image: "/mock/pizza-calabresa.jpg",
    available: true,
    status: "Ativo",
  },
  {
    id: "pizza-quatro-queijos",
    name: "Pizza Quatro Queijos",
    description: "Mussarela, gorgonzola, parmesão e catupiry.",
    categoryId: "pizzas",
    categoryName: "Pizzas Salgadas",
    price: 44.9,
    previousPrice: 49.9,
    discount: 10,
    image: "/mock/pizza-margherita.jpg",
    available: true,
    status: "Ativo",
  },
  {
    id: "brownie",
    name: "Brownie de Chocolate",
    description: "Brownie artesanal com calda de chocolate.",
    categoryId: "sobremesas",
    categoryName: "Sobremesas",
    price: 16.9,
    image: "/mock/brownie.jpg",
    available: true,
    status: "Ativo",
  },
];

export const featuredProducts = products.filter((product) =>
  ["pizza-calabresa", "pizza-margherita", "combo-familia", "batata-frita"].includes(product.id),
);

export const promo = {
  title: "Promoção do dia!",
  productName: "Combo Família",
  description: "Pizza grande, refrigerante 2L e batata frita para compartilhar.",
  price: 74.9,
  previousPrice: 89.9,
  image: "/mock/promo.jpg",
  href: "/loja/pizzaria-imperial/produto/combo-familia",
};

export const addonGroups: AddonGroup[] = [
  {
    id: "molhos",
    name: "Molhos",
    required: false,
    min: 0,
    max: 2,
    productCount: 12,
    options: [
      { id: "barbecue", name: "Molho Barbecue", price: 2 },
      { id: "rose", name: "Molho Rosê", price: 2 },
      { id: "maionese", name: "Maionese Temperada", price: 2 },
    ],
  },
  {
    id: "bordas",
    name: "Bordas",
    required: true,
    min: 1,
    max: 1,
    productCount: 8,
    options: [
      { id: "sem-borda", name: "Sem borda", price: 0 },
      { id: "catupiry", name: "Catupiry", price: 4 },
      { id: "cheddar", name: "Cheddar", price: 4 },
      { id: "chocolate", name: "Chocolate", price: 5 },
    ],
  },
  {
    id: "bebidas-addon",
    name: "Bebidas",
    required: false,
    min: 0,
    max: 3,
    productCount: 15,
    options: [
      { id: "cola", name: "Refrigerante Cola 2L", price: 12 },
      { id: "guarana", name: "Guaraná 2L", price: 11 },
      { id: "agua", name: "Água 500ml", price: 4 },
    ],
  },
  {
    id: "tamanhos",
    name: "Tamanhos",
    required: true,
    min: 1,
    max: 1,
    productCount: 10,
    options: [
      { id: "media", name: "Média", price: 0 },
      { id: "grande", name: "Grande", price: 8 },
      { id: "familia", name: "Família", price: 16 },
    ],
  },
];

export const suggestedProducts = [
  {
    id: "combo-familia",
    name: "Combo Família",
    price: 74.9,
    previousPrice: 89.9,
    discount: 17,
    image: "/mock/combo-familia.jpg",
  },
  {
    id: "batata-frita",
    name: "Batata Frita Grande",
    price: 19.9,
    image: "/mock/batata-frita.jpg",
  },
  {
    id: "pizza-quatro-queijos",
    name: "Pizza Quatro Queijos",
    price: 44.9,
    previousPrice: 49.9,
    discount: 10,
    image: "/mock/pizza-margherita.jpg",
  },
  {
    id: "brownie",
    name: "Brownie de Chocolate",
    price: 16.9,
    image: "/mock/brownie.jpg",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((product) => product.categoryId === categoryId);
}
